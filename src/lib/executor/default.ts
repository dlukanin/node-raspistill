import {IRaspistillExecutor} from './interfaces';
import {execFile, spawn} from 'child_process';
import * as imageType from 'image-type';

export class DefaultRaspistillExecutor implements IRaspistillExecutor {
    private command: string = 'raspistill';
    private maxBuffer: number = 400 * 1024;

    public exec(args: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            execFile(
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

            childProcess.on('close', () => {
                childProcess.kill();

                if (error) {
                    reject(error);
                }

                if (errorBuffer.toString().length) {
                    reject(new Error(errorBuffer.toString()));
                }

                resolve(photoBuffer);
            });

            childProcess.stdout.on('data', (data: Buffer) => {
                photoBuffer = Buffer.concat([photoBuffer, data]);
            });

            childProcess.stderr.on('data', (data: Buffer) => {
                errorBuffer = Buffer.concat([errorBuffer, data]);
            });
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

            childProcess.on('close', () => {
                if (error) {
                    childProcess.kill();
                    reject(error);
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
        });
    }
}