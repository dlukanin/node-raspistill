
import * as sinon from 'sinon';
import { DefaultCamera } from '../lib/camera/default';
import { RaspistillInterruptError } from '../lib/error/interrupt';
import * as rmfr from 'rmfr';

// NOTE we cast child_process as any because of sinon patching
const child_process = require('child_process');
import fs = require('fs-promise');
/* tslint:enable */

// TODO refactor me

describe('camera', function () {
    const sandbox = sinon.createSandbox();
    const PHOTOS_DIR = './photos';
    const FILE_NAME = 'test';
    const FILE_ENC = 'jpg';
    const FILE_DATA = '111';

    let firstPhotoBuffer: Buffer;

    const camera = new DefaultCamera({ outputDir: PHOTOS_DIR });

    // this.timeout(4000);

    beforeEach(() => {
        sandbox.stub(
            child_process,
            'execFile'
        ).callsFake(async (arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void) => {
            try {
                await fs.mkdir(PHOTOS_DIR)
            } catch (e) {
                return;
            }
            try {
                await fs.writeFile(PHOTOS_DIR + '/' + FILE_NAME + '.' + FILE_ENC, Date.now() + FILE_DATA)
                callback(null, 'success');
            } catch (e) {
                return callback(e);
            }

        });
    });

    afterEach(async () => {
        await rmfr(PHOTOS_DIR)
        sandbox.restore();
    });

    it('should round width and height values passed to constructor', () => {
        const camera = new DefaultCamera({
            width: 800.12,
            height: 599.90
        });

        expect(camera.getOption('width')).toBe(800)
        expect(camera.getOption('height')).toBe(600);

    });

    it('should use default args while executing raspistill command', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera();

        camera.takePhoto();

        const args: any[] = child_process.execFile.args[0];

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual(['-n', '-e', 'jpg', '-o', args[1][4]]); // TODO path check
        done()
    });

    it('should set default options', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera({
            width: 1000,
            outputDir: PHOTOS_DIR + '/test'
        });

        camera.takePhoto('foo');

        const fooArgs: any[] = child_process.execFile.args[0];

        expect(fooArgs[0]).toBe('raspistill');
        expect(fooArgs[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-w', '1000', '-h', '1000', '-o', PHOTOS_DIR + '/test/foo.jpg'
        ]);

        camera.setDefaultOptions();
        camera.takePhoto('bar');

        const barArgs: any[] = child_process.execFile.args[1];

        expect(barArgs[0]).toBe('raspistill');
        expect(barArgs[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-o', 'photos/bar.jpg'
        ]);
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

    it('should apply custom args raspistill command', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera({
            verticalFlip: true,
            horizontalFlip: true,
            noPreview: false,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'foo',
            encoding: 'png',
            width: 1000,
            height: 800,
            shutterspeed: 10,
            iso: 100,
            brightness: 10,
            contrast: 10,
            saturation: 10,
            time: 1,
            rotation: 100,
            awb: 'auto',
            awbg: '1.5,1.2'
        });

        camera.takePhoto();
        camera.takePhoto('test');
        camera.setOptions({
            noPreview: true,
            height: undefined
        });
        camera.takePhoto('anotherTest');

        const args: any[] = child_process.execFile.args[0];
        const secondCallArgs: any[] = child_process.execFile.args[1];
        const thirdCallArgs: any[] = child_process.execFile.args[2];

        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/foo.png'
        ]);

        expect(secondCallArgs[0]).toBe('raspistill');
        expect(secondCallArgs[1]).toStrictEqual([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/test.png'
        ]);

        expect(thirdCallArgs[0]).toBe('raspistill');
        expect(thirdCallArgs[1]).toStrictEqual([
            '-vf', '-hf', '-n', '-e', 'png', '-w', '1000', '-h', '1000', '-t', '1',
            '-ISO', '100', '-ss', '10', '-co', '10', '-br', '10', '-sa', '10', '-awb', 'auto', '-awbg', '1.5,1.2',
            '-rot', '100', '-o',
            PHOTOS_DIR + '/test/anotherTest.png'
        ]);
        done();
    });

    it('should return buffer object with noFileSave option', (done: jest.DoneCallback) => {
        const originalSpawn = child_process.spawn;

        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', ['src/test/helpers/child_process.js']);
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

        expect(child_process.execFile.args.length).toBe(0);

        const args: any = child_process.spawn.args[0];
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-o', '-'
        ]);

        done();
    });

    it('should take photo', async (done: jest.DoneCallback) => {
        try {
            const data = await camera.takePhoto(FILE_NAME)
            expect(data).toBeInstanceOf(Buffer);
            firstPhotoBuffer = data;
            done()
        } catch (e) {
            done(e)
        }
    });

    it('should take photo with same name', async (done: jest.DoneCallback) => {
        try {
            const data = await camera.takePhoto(FILE_NAME)
            expect(data).toBeInstanceOf(Buffer);
            expect(data).not.toBe(firstPhotoBuffer)
            done();
        } catch (error) {
            done(error);
        }
    });

    it('should exec camera in timelapse mode (no file save)', (done: jest.DoneCallback) => {
        const originalSpawn = child_process.spawn;
        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', ['src/test/helpers/child_process_timelapse.js']);
        });

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

        const args: any = child_process.spawn.args[0];
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-t', '3000', '-tl', '500', '-o', '-'
        ]);
    });

    it('should exec camera in timelapse mode (file save)', (done: jest.DoneCallback) => {
        child_process.execFile.restore();

        sandbox.stub(
            child_process,
            'execFile'
        ).callsFake(function (arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void): void {
            const process = child_process.spawn('node', ['src/test/helpers/child_process_timelapse_file.js']);
            process.on('close', function (): void {
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

        const args: any = child_process.execFile.args[0];
        expect(args[0]).toBe('raspistill');
        expect(args[1]).toStrictEqual([
            '-n', '-e', 'jpg', '-t', '2000', '-tl', '400', '-o', PHOTOS_DIR + '/image%04d.jpg'
        ]);
    });

    it('should force stop (takePhoto)', (done: jest.DoneCallback) => {
        const camera = new DefaultCamera();

        camera.takePhoto()
            .then((photo) => {
                //done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                //done();
            });

        camera.stop();
    });

    it('should force stop (takePhoto with no file save)', (done: jest.DoneCallback) => {

        const originalSpawn = child_process.spawn;

        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', ['src/test/helpers/child_process_timelapse.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true
        });

        camera.takePhoto()
            .then((photo) => {
                done('Camera should not take photo');
            })
            .catch((error) => {
                expect(error).toBeInstanceOf(RaspistillInterruptError);
                done();
            });

        camera.stop();
    });

    it('should force stop (timelapse)', (done: jest.DoneCallback) => {
        // this.timeout(4000);
        child_process.execFile.restore();

        sandbox.stub(
            child_process,
            'execFile'
        ).callsFake(function (arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void): void {
            const process = child_process.spawn('node', ['src/test/helpers/child_process_timelapse_file.js']);
            process.on('close', function (): void {
                callback(null, 'success');
            });
        });

        const camera = new DefaultCamera({
            outputDir: PHOTOS_DIR,
            fileName: 'image%04d',
            encoding: 'jpg'
        });

        let i = 0;
        camera.timelapse(500, 3000, (image) => {
            i++;
        }).then(() => {
            done('Timelapse should not resolve');
        }).catch((err) => {
            expect(err).toBeInstanceOf(RaspistillInterruptError);
            done();
        });

        camera.stop();
    });

    it('should force stop (timelapse with no file save)', (done: jest.DoneCallback) => {

        const originalSpawn = child_process.spawn;

        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', ['src/test/helpers/child_process_timelapse.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test'
        });

        let i = 0;
        camera.timelapse(500, 3000, (image) => {
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