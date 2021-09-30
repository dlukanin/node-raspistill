import * as util from 'util';
import * as rimraf from 'rimraf';
import { DefaultCamera } from '../src/lib/camera/default';
import { RaspistillDefaultError, RaspistillInterruptError } from '../src';

const rmrf = util.promisify(rimraf);

// NOTE we cast child_process as any because of sinon patching
/* eslint-disable */
const childProcess = require('child_process');
const fs = require('fs-promise');

/* eslint-enable */

// TODO refactor me

describe('camera', () => {
    const PHOTOS_DIR = './photos';
    const FILE_NAME = 'test';
    const FILE_ENC = 'jpg';
    const FILE_DATA = '111';

    let firstPhotoBuffer: Buffer;

    let camera: DefaultCamera;

    let execFileSpy;

    beforeEach(async () => {
        camera = new DefaultCamera({ outputDir: PHOTOS_DIR });

        try {
            await fs.mkdir(PHOTOS_DIR);
        } catch (e) {
            return;
        }

        execFileSpy = spyOn(childProcess, 'execFile').and.callFake(
            async (arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void) => {
                try {
                    await fs.writeFile(`${PHOTOS_DIR}/${FILE_NAME}.${FILE_ENC}`, Date.now() + FILE_DATA);
                    callback(null, 'success');
                } catch (e) {
                    return callback(e);
                }
            },
        );
    });

    afterEach(async () => {
        await rmrf(PHOTOS_DIR);
    });

    it('should use default args while executing raspistill command', (done: jest.DoneCallback) => {
        const testCamera = new DefaultCamera();

        testCamera.takePhoto();

        const args: any[] = execFileSpy.calls.mostRecent().args;

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual(['-n', '-e', 'jpg', '-o', args[1][4]]); // TODO path check
        done();
    });

    it('should change options from one value to another', () => {
        const testCamera = new DefaultCamera({
            noFileSave: true,
        });

        testCamera.setOptions({
            noFileSave: false,
        });

        expect(testCamera.getOption('noFileSave')).toBe(false);
    });

    it('should apply custom args raspistill command', async (done: jest.DoneCallback) => {
        const testCamera = new DefaultCamera({
            verticalFlip: true,
            horizontalFlip: true,
            noPreview: false,
            outputDir: `${PHOTOS_DIR}/test`,
            fileName: 'foo',
            encoding: 'png',
            width: 1000,
            height: 800,
            time: 1,
            iso: 100,
            shutterspeed: 10,
            contrast: 20,
            brightness: 15,
            saturation: 30,
            awb: 'auto',
            awbg: '1.5,1.2',
            rotation: 100,
            exposure: 'night',
            flicker: 'off',
            imageEffect: 'oilpaint',
            drc: 'high',
        });

        testCamera.takePhoto();
        testCamera.takePhoto('test');
        testCamera.setOptions({
            noPreview: true,
            height: 700,
        });
        testCamera.takePhoto('anotherTest');

        const allCalls = execFileSpy.calls.all();
        const args = allCalls[0].args;
        const secondCallArgs = allCalls[1].args;
        const thirdCallArgs = allCalls[2].args;

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-vf',
            '-hf',
            '-e',
            'png',
            '-w',
            '1000',
            '-h',
            '800',
            '-t',
            '1',
            '-ISO',
            '100',
            '-ss',
            '10',
            '-co',
            '20',
            '-br',
            '15',
            '-sa',
            '30',
            '-awb',
            'auto',
            '-awbg',
            '1.5,1.2',
            '-rot',
            '100',
            '-ex',
            'night',
            '-fli',
            'off',
            '-ifx',
            'oilpaint',
            '-drc',
            'high',
            '-o',
            `${PHOTOS_DIR}/test/foo.png`,
        ]);

        expect(secondCallArgs[0]).toBe('raspistill');
        expect(secondCallArgs[1]).toStrictEqual([
            '-vf',
            '-hf',
            '-e',
            'png',
            '-w',
            '1000',
            '-h',
            '800',
            '-t',
            '1',
            '-ISO',
            '100',
            '-ss',
            '10',
            '-co',
            '20',
            '-br',
            '15',
            '-sa',
            '30',
            '-awb',
            'auto',
            '-awbg',
            '1.5,1.2',
            '-rot',
            '100',
            '-ex',
            'night',
            '-fli',
            'off',
            '-ifx',
            'oilpaint',
            '-drc',
            'high',
            '-o',
            `${PHOTOS_DIR}/test/test.png`,
        ]);

        expect(thirdCallArgs[0]).toBe('raspistill');
        expect(thirdCallArgs[1]).toStrictEqual([
            '-vf',
            '-hf',
            '-n',
            '-e',
            'png',
            '-w',
            '1000',
            '-h',
            '700',
            '-t',
            '1',
            '-ISO',
            '100',
            '-ss',
            '10',
            '-co',
            '20',
            '-br',
            '15',
            '-sa',
            '30',
            '-awb',
            'auto',
            '-awbg',
            '1.5,1.2',
            '-rot',
            '100',
            '-ex',
            'night',
            '-fli',
            'off',
            '-ifx',
            'oilpaint',
            '-drc',
            'high',
            '-o',
            `${PHOTOS_DIR}/test/anotherTest.png`,
        ]);
        done();
    });

    it('should return buffer object with noFileSave option', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        const spawnSpy = spyOn(childProcess, 'spawn').and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process.js']);
        });

        const testCamera = new DefaultCamera({
            noFileSave: true,
            outputDir: `${PHOTOS_DIR}/test`,
            fileName: 'no_file_saved',
            encoding: 'jpg',
        });

        testCamera
            .takePhoto()
            .then((data: any) => {
                expect(data).toBeInstanceOf(Buffer);
            })
            .catch((error) => {
                done(error);
            });

        expect(execFileSpy).not.toHaveBeenCalled();

        const args = spawnSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual(['-n', '-e', 'jpg', '-o', '-']);

        done();
    });

    it('should return error object with noFileSave and stdout err', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        spyOn(childProcess, 'spawn').and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_err.js']);
        });

        const testCamera = new DefaultCamera({
            noFileSave: true,
            outputDir: `${PHOTOS_DIR}/test`,
            fileName: 'no_file_saved',
            encoding: 'jpg',
        });

        testCamera
            .takePhoto()
            .then(() => {
                done('Should not be called');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillDefaultError);
                done();
            });
    });

    it('should take photo', async (done: jest.DoneCallback) => {
        try {
            const data = await camera.takePhoto(FILE_NAME);
            expect(data).toBeInstanceOf(Buffer);
            firstPhotoBuffer = data;
            done();
        } catch (e) {
            done(e);
        }
    });

    it('should take photo with same name', async (done: jest.DoneCallback) => {
        try {
            const data = await camera.takePhoto(FILE_NAME);
            expect(data).toBeInstanceOf(Buffer);
            expect(data).not.toBe(firstPhotoBuffer);
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should exec camera in timelapse mode (no file save)', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        const spawnSpy = spyOn(childProcess, 'spawn').and.callFake(() =>
            originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js']),
        );

        const testCamera = new DefaultCamera({
            noFileSave: true,
            outputDir: `${PHOTOS_DIR}/test`,
            fileName: 'no_file_saved',
            encoding: 'jpg',
        });

        let i = 0;
        testCamera
            .timelapse(500, 3000, (image) => {
                expect(image).toBeInstanceOf(Buffer);
                i += 1;
            })
            .then(() => {
                expect(i).toBe(5);
                done();
            })
            .catch((err) => {
                done(err);
            });

        const args: any = spawnSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual(['-n', '-e', 'jpg', '-t', '3000', '-tl', '500', '-o', '-']);
    });

    it('should exec camera in timelapse mode (file save)', (done: jest.DoneCallback) => {
        execFileSpy.and.callFake((arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void) => {
            const process = childProcess.spawn('node', ['test/helpers/child_process_timelapse_file.js']);
            process.on('close', () => {
                callback(null, 'success');
            });
        });

        const testCamera = new DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg',
        });

        let i = 0;
        testCamera
            .timelapse(400, 2000, (image) => {
                expect(image).toBeInstanceOf(Buffer);
                i += 1;
            })
            .then(() => {
                expect(i).toBe(5);
                done();
            })
            .catch((err) => {
                done(err);
            });

        const args: any = execFileSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n',
            '-e',
            'jpg',
            '-t',
            '2000',
            '-tl',
            '400',
            '-o',
            `${PHOTOS_DIR}/image%04d.jpg`,
        ]);
    });

    it('should force stop (takePhoto)', (done: jest.DoneCallback) => {
        const testCamera = new DefaultCamera();

        testCamera
            .takePhoto()
            .then(() => {
                done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        testCamera.stop();
    });

    it('should force stop (takePhoto with no file save)', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        spyOn(childProcess, 'spawn').and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js']);
        });

        const testCamera = new DefaultCamera({
            noFileSave: true,
        });

        testCamera
            .takePhoto()
            .then(() => {
                done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        testCamera.stop();
    });

    it('should force stop (timelapse)', (done: jest.DoneCallback) => {
        execFileSpy.and.callFake((arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void) => {
            const process = childProcess.spawn('node', ['test/helpers/child_process_timelapse_file.js']);
            process.on('close', () => {
                callback(null, 'success');
            });
        });

        const testCamera = new DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg',
        });

        testCamera
            .timelapse(500, 3000, () => {
                // do nothing
            })
            .then(() => {
                done('Timelapse should not resolve');
            })
            .catch((err) => {
                expect(err).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        testCamera.stop();
    });

    it('should force stop (timelapse with no file save)', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;

        spyOn(childProcess, 'spawn').and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js']);
        });

        const testCamera = new DefaultCamera({
            noFileSave: true,
            outputDir: `${PHOTOS_DIR}/test`,
        });

        testCamera
            .timelapse(500, 3000, (img: Buffer) => {
                expect(img).toBeInstanceOf(Buffer);
            })
            .then(() => {
                done('Timelapse should not resolve');
            })
            .catch((err) => {
                expect(err).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        testCamera.stop();
    });
});
