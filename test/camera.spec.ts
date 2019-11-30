import { DefaultCamera } from '../src/lib/camera/default';
import { RaspistillInterruptError } from '../src';
import * as util from 'util';
import * as rimraf from 'rimraf';

const rmrf = util.promisify(rimraf);

// NOTE we cast child_process as any because of sinon patching
// tslint:disable-next-line:no-var-requires
const childProcess = require('child_process');
import fs = require('fs-promise');
/* tslint:enable */

// TODO refactor me

describe('camera', function(): void {
    const PHOTOS_DIR = './photos';
    const FILE_NAME = 'test';
    const FILE_ENC = 'jpg';
    const FILE_DATA = '111';

    let firstPhotoBuffer: Buffer;

    const camera = new DefaultCamera({ outputDir: PHOTOS_DIR });

    let execFileSpy;

    beforeEach(async () => {
        try {
            await fs.mkdir(PHOTOS_DIR);
        } catch (e) {
            return;
        }

        execFileSpy = spyOn(childProcess, 'execFile')
            .and.callFake(async (arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void) => {
                try {
                    await fs.writeFile(PHOTOS_DIR + '/' + FILE_NAME + '.' + FILE_ENC, Date.now() + FILE_DATA);
                    callback(null, 'success');
                } catch (e) {
                    return callback(e);
                }
            });
    });

    afterEach(async () => {
        await rmrf(PHOTOS_DIR);
    });

    it('should use default args while executing raspistill command', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera();

        camera.takePhoto();

        const args: any[] = execFileSpy.calls.mostRecent().args;

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual(['-n', '-e', 'jpg', '-o', args[1][4]]); // TODO path check
        done();
    });

    it('should change options from one value to another', () => {
        const camera = new DefaultCamera({
            noFileSave: true
        });

        camera.setOptions({
            noFileSave: false
        });

        expect(camera.getOption('noFileSave')).toBe(false);

    });

    xit('should apply custom args raspistill command', async (done: jest.DoneCallback) => {
        const camera = new DefaultCamera({
            verticalFlip: true,
            horizontalFlip: true,
            noPreview: false,
            outputDir: PHOTOS_DIR + '/test',
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
            rotation: 100
        });

        await camera.takePhoto();
        await camera.takePhoto('test');
        camera.setOptions({
            noPreview: true,
            height: 700
        });
        await camera.takePhoto('anotherTest');

        const allCalls = execFileSpy.calls.all();
        const args = allCalls[0].args;
        const secondCallArgs = allCalls[1].args;
        const thirdCallArgs = allCalls[2].args;

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '700', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '20', '-br', '15', '-sa', '30', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/foo.png'
        ]);

        expect(secondCallArgs[0]).toBe('raspistill');
        expect(secondCallArgs[1]).toStrictEqual([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '700', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '20', '-br', '15', '-sa', '30', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/test.png'
        ]);

        expect(thirdCallArgs[0]).toBe('raspistill');
        expect(thirdCallArgs[1]).toStrictEqual([
            '-vf', '-hf', '-n', '-e', 'png', '-w', '1000', '-h', '800', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '20', '-br', '15', '-sa', '30', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/anotherTest.png'
        ]);
        done();
    });

    it('should return buffer object with noFileSave option', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        const spawnSpy = spyOn(childProcess, 'spawn')
            .and.callFake(() => {
                return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process.js']);
            });

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });

        camera.takePhoto()
            .then((data: any) => {
                expect(data).toBeInstanceOf(Buffer);
            })
            .catch((error) => {
                done(error);
            });

        expect(execFileSpy).not.toHaveBeenCalled();

        const args = spawnSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-o', '-'
        ]);

        done();
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
        const spawnSpy = spyOn(
            childProcess,
            'spawn'
        ).and.callFake(() =>
            originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js'])
        );

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });

        let i = 0;
        camera.timelapse(500, 3000, (image) => {
            expect(image).toBeInstanceOf(Buffer);
            i++;
        }).then(() => {
            expect(i).toBe(5);
            done();
        }).catch((err) => {
            done(err);
        });

        const args: any = spawnSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-t', '3000', '-tl', '500', '-o', '-'
        ]);
    });

    it('should exec camera in timelapse mode (file save)', (done: jest.DoneCallback) => {
        execFileSpy.and.callFake(function(
            arg: any,
            secondArg: any,
            opts: any,
            callback: (...args: any[]) => void
        ): void {
            const process = childProcess.spawn('node', ['test/helpers/child_process_timelapse_file.js']);
            process.on('close', function(): void {
                callback(null, 'success');
            });
        });

        const camera = new DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg'
        });

        let i = 0;
        camera.timelapse(400, 2000, (image) => {
            expect(image).toBeInstanceOf(Buffer);
            i++;
        }).then(() => {
            expect(i).toBe(5);
            done();
        }).catch((err) => {
            done(err);
        });

        const args: any = execFileSpy.calls.mostRecent().args;
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-t', '2000', '-tl', '400', '-o', PHOTOS_DIR + '/image%04d.jpg'
        ]);
    });

    it('should force stop (takePhoto)', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera();

        camera.takePhoto()
            .then(() => {
                done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        camera.stop();
    });

    it('should force stop (takePhoto with no file save)', (done: jest.DoneCallback) => {
        const originalSpawn = childProcess.spawn;
        spyOn(
            childProcess,
            'spawn'
        ).and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true
        });

        camera.takePhoto()
            .then(() => {
                done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        camera.stop();
    });

    it('should force stop (timelapse)', (done: jest.DoneCallback) => {
        execFileSpy.and.callFake(function(
            arg: any,
            secondArg: any,
            opts: any,
            callback: (...args: any[]) => void
        ): void {
            const process = childProcess.spawn('node', ['test/helpers/child_process_timelapse_file.js']);
            process.on('close', function(): void {
                callback(null, 'success');
            });
        });

        const camera = new DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg'
        });

        camera.timelapse(500, 3000, () => {
            // do nothing
        }).then(() => {
            done('Timelapse should not resolve');
        }).catch((err) => {
            expect(err).toBeInstanceOf(RaspistillInterruptError);
            done();
        });

        camera.stop();
    });

    it('should force stop (timelapse with no file save)', (done: jest.DoneCallback) => {

        const originalSpawn = childProcess.spawn;

        spyOn(
            childProcess,
            'spawn'
        ).and.callFake(() => {
            return originalSpawn.call(childProcess, 'node', ['test/helpers/child_process_timelapse.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test'
        });

        let i = 0;
        camera.timelapse(500, 3000, () => {
            i++;
        }).then(() => {
            done('Timelapse should not resolve');
        }).catch((err) => {
            expect(err).toBeInstanceOf(RaspistillInterruptError);
            done();
        });

        camera.stop();
    });

});
