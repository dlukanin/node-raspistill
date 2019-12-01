import { IRaspistillExecutor } from './interfaces';
import { execFile, spawn } from 'child_process';
import * as imageType from 'image-type';
import { ChildProcess } from 'child_process';
import { RaspistillInterruptError } from '../error/interrupt';
import { RaspistillDefaultError } from '../error/raspistill';

export class DefaultRaspistillExecutor implements IRaspistillExecutor {
    /**
     * Signal for closing watch action.
     * @type {string}
     */
    private readonly _forceCloseSignal: 'SIGTERM' = 'SIGTERM';

    private _childProcess: ChildProcess;

    private _command: string = 'raspistill';
    private _maxBuffer: number = 400 * 1024;

    public async exec(args: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this._childProcess = execFile(
                this._command,
                args,
                {
                    maxBuffer: this._maxBuffer,
                    encoding: 'buffer'
                },
                (error: any, stdout, stderr) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(stdout);
                }
            );
        });
    }

    public async spawnAndGetImage(args: string[]): Promise<Buffer> {
        return await new Promise((resolve, reject) => {
            let photoBuffer: Buffer = Buffer.alloc(0);
            let errorBuffer: Buffer = Buffer.alloc(0);
            let error: any;

            const childProcess = spawn(
                this._command,
                args
            );

            childProcess.on('error', (processError: any) => {
                error = processError;
            });

            childProcess.on('exit', (code: string, signal: string) => {
                if (signal === this._forceCloseSignal) {
                    reject(new RaspistillInterruptError());
                    return;
                }

                if (error) {
                    reject(error);
                    return;
                }

                if (errorBuffer.toString().length) {
                    reject(new RaspistillDefaultError(
                        RaspistillDefaultError.CODE_SPAWN_PROC_ERROR, errorBuffer.toString()
                    ));

                    return;
                }

                resolve(photoBuffer);
            });

            childProcess.stdout.on('data', (data: Buffer) => {
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });

            childProcess.stderr.on('data', (data: Buffer) => {
                errorBuffer = Buffer.concat([errorBuffer, data]);
            });

            this._childProcess = childProcess;
        });
    }

    public async spawnAndGetImages(args: string[], cb: (image: Buffer) => any): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            let photoBuffer: Buffer = Buffer.alloc(0);
            let error: any;

            const childProcess = spawn(
                this._command,
                args
            );

            childProcess.on('error', (processError: any) => {
                error = processError;
            });

            childProcess.on('exit', (code: string, signal: string) => {
                if (signal === this._forceCloseSignal) {
                    reject(new RaspistillInterruptError());
                    return;
                }

                if (error) {
                    childProcess.kill();
                    reject(error);
                    return;
                }

                cb(photoBuffer);
                resolve();
            });

            childProcess.stdout.on('data', (data: Buffer) => {
                if (imageType(data) && photoBuffer.length) {
                    cb(photoBuffer);
                    photoBuffer = data;
                    return;
                }
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });

            this._childProcess = childProcess;
        });
    }

    public killProcess(): void {
        if (this._childProcess && this._childProcess.kill) {
            this._childProcess.kill(this._forceCloseSignal);
        }
    }
}