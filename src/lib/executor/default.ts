import {IRaspistillExecutor} from './interfaces';
import {execFile, spawn} from 'child_process';
import * as imageType from 'image-type';
import {ChildProcess} from 'child_process';
import {RaspistillInterruptError} from '../error/interrupt';

// TODO refactor me

export class DefaultRaspistillExecutor implements IRaspistillExecutor {
    /**
     * Signal for closing watch action.
     * @type {string}
     */
    public static readonly FORCE_CLOSE_SIGNAL: string = 'SIGTERM';

    private childProcess: ChildProcess;

    private command: string = 'raspistill';
    private maxBuffer: number = 400 * 1024;

    public exec(args: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this.childProcess = execFile(
                this.command,
                args,
                {
                    maxBuffer: this.maxBuffer,
                    encoding: 'binary'
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

    public spawnAndGetImage(args: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            let photoBuffer: Buffer = new Buffer(0);
            let errorBuffer: Buffer = new Buffer(0);
            let error: any;

            const childProcess = spawn(
                this.command,
                args
            );

            childProcess.on('error', (processError: any) => {
                error = processError;
            });

            childProcess.on('exit', (code: string, signal: string) => {
                if (signal === DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL) {
                    reject(new RaspistillInterruptError());
                    return;
                }

                if (error) {
                    reject(error);
                    return;
                }

                if (errorBuffer.toString().length) {
                    reject(new Error(errorBuffer.toString()));
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

            this.childProcess = childProcess;
        });
    }

    public spawnAndGetImages(args: string[], cb: (image: Buffer) => any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let photoBuffer: Buffer = new Buffer(0);
            let error: any;

            const childProcess = spawn(
                this.command,
                args
            );

            childProcess.on('error', (processError: any) => {
                error = processError;
            });

            childProcess.on('exit', (code: string, signal: string) => {
                if (signal === DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL) {
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

            this.childProcess = childProcess;
        });
    }

    public killProcess(): void {
        if (this.childProcess) {
            this.childProcess.kill(DefaultRaspistillExecutor.FORCE_CLOSE_SIGNAL);
        }
    }
}
