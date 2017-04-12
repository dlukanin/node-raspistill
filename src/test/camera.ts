import {expect} from 'chai';
import * as sinon from 'sinon';
import {DefaultCamera} from '../lib/camera/default';
import {TMochaDoneFunction} from './main';
/* tslint:disable */
// NOTE we cast child_process as any because of sinon patching
const child_process = require('child_process');
const fs = require('fs-promise');
/* tslint:enable */

describe('camera', function(): void {
    const sandbox = sinon.sandbox.create();
    const PHOTOS_DIR = './photos';
    const FILE_NAME = 'test';
    const FILE_ENC = 'jpg';
    const FILE_DATA = '111';

    let firstPhotoBuffer: Buffer;

    const camera = new DefaultCamera({outputDir: PHOTOS_DIR});

    this.timeout(4000);

    beforeEach(function(done: TMochaDoneFunction): void {
        sandbox.stub(
            child_process,
            'execFile'
        ).callsFake(function(arg: any, secondArg: any, opts: any, callback: (...args: any[]) => void): void {
            fs.mkdir(PHOTOS_DIR)
                .catch(() => {
                    return;
                })
                .then(() => fs.writeFile(PHOTOS_DIR + '/' + FILE_NAME + '.' + FILE_ENC, Date.now() + FILE_DATA))
                .then(() => {
                    callback(null, 'success');
                })
                .catch((error) => {
                    callback(error);
                });
        });
        done();
    });

    it('should round width and height values passed to constructor', (done: TMochaDoneFunction) => {
        const camera = new DefaultCamera({
            width: 800.12,
            height: 599.90
        });

        expect(camera.getOption('width')).to.eq(800);
        expect(camera.getOption('height')).to.eq(600);

        done();
    });

    it('should use default args while executing raspistill command', (done: TMochaDoneFunction) => {
        const camera = new DefaultCamera();

        camera.takePhoto();

        const args: any[] = child_process.execFile.args[0];

        expect(args[0]).to.eql('raspistill');
        expect(args[1]).to.eql(['-n', '-e', 'jpg', '-o', args[1][4]]); // TODO path check

        done();
    });

    it('should set default options', (done: TMochaDoneFunction) => {
        const camera = new DefaultCamera({
            width: 1000,
            outputDir: PHOTOS_DIR + '/test'
        });

        camera.takePhoto('foo');

        const fooArgs: any[] = child_process.execFile.args[0];

        expect(fooArgs[0]).to.eql('raspistill');
        expect(fooArgs[1]).to.eql([
            '-n', '-e', 'jpg', '-w', '1000', '-h', '1000', '-o', PHOTOS_DIR + '/test/foo.jpg'
        ]);

        camera.setDefaultOptions();
        camera.takePhoto('bar');

        const barArgs: any[] = child_process.execFile.args[1];

        expect(barArgs[0]).to.eql('raspistill');
        expect(barArgs[1]).to.eql([
            '-n', '-e', 'jpg', '-o', 'photos/bar.jpg'
        ]);
        done();
    });

    it('should apply custom args raspistill command', (done: TMochaDoneFunction) => {
        const camera = new DefaultCamera({
            verticalFlip: true,
            horizontalFlip: true,
            noPreview: false,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'foo',
            encoding: 'png',
            width: 1000,
            height: 800
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

        expect(args[0]).to.eql('raspistill');
        expect(args[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-o', PHOTOS_DIR + '/test/foo.png'
        ]);

        expect(secondCallArgs[0]).to.eql('raspistill');
        expect(secondCallArgs[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '800', '-o', PHOTOS_DIR + '/test/test.png'
        ]);

        expect(thirdCallArgs[0]).to.eql('raspistill');
        expect(thirdCallArgs[1]).to.eql([
            '-vf', '-hf', '-e', 'png', '-w', '1000', '-h', '1000', '-n', '-o', PHOTOS_DIR + '/test/anotherTest.png'
        ]);

        done();
    });

    it('should return buffer object with noFileSave option', (done: TMochaDoneFunction) => {
        const originalSpawn = child_process.spawn;

        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });

        camera.takePhoto()
            .then((data: any) => {
                expect(data).to.be.instanceof(Buffer);
            })
            .catch((error) => {
                done(error);
            });

        expect(child_process.execFile.args.length).to.eq(0);

        const args: any = child_process.spawn.args[0];
        expect(args[0]).to.eql('raspistill');
        expect(args[1]).to.eql([
            '-n', '-e', 'jpg', '-o', '-'
        ]);

        done();
    });

    it('should take photo', (done: TMochaDoneFunction) => {
        camera.takePhoto(FILE_NAME)
            .then((data: any) => {
                expect(data).to.be.instanceOf(Buffer);
                firstPhotoBuffer = data;
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should take photo with same name', (done: TMochaDoneFunction) => {
        camera.takePhoto(FILE_NAME)
            .then((data: any) => {
                expect(data).to.be.instanceOf(Buffer);
                expect(data).to.be.not.eql(firstPhotoBuffer);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should exec camera in timelapse mode', function(done: TMochaDoneFunction): void {
        const originalSpawn = child_process.spawn;

        sandbox.stub(
            child_process,
            'spawn'
        ).callsFake((command: string, args: string[]) => {
            return originalSpawn.call(child_process, 'node', [__dirname + '/helpers/child_process_timelapse.js']);
        });

        const camera = new DefaultCamera({
            noFileSave: true,
            outputDir: PHOTOS_DIR + '/test',
            fileName: 'no_file_saved',
            encoding: 'jpg'
        });

        let i = 0;
        camera.timelapse(500, 10000, (image) => {
            expect(image).to.be.instanceOf(Buffer);
            i++;
        }).then(() => {
            expect(i).to.eq(4);
            done();
        }).catch((err) => {
            done(err);
        });
    });

    afterEach(function(): void {
        sandbox.restore();
    });

    after(function(done: TMochaDoneFunction): void {
        fs.rmdir(PHOTOS_DIR + '/test')
            .then(() => fs.unlink(PHOTOS_DIR + '/' + FILE_NAME + '.' + FILE_ENC))
            .then(() => fs.rmdir(PHOTOS_DIR))
            .then(() => {
                done();
            })
            .catch((error) => {
                done(error);
            });
    });
});