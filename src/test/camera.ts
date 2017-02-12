import {expect} from 'chai';
import * as fs from 'fs-promise';
import * as sinon from 'sinon';
import {DefaultCamera} from '../lib/camera/default';
/* tslint:disable */
// NOTE we cast child_process as any because of sinon patching
const child_process = require('child_process');
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

    beforeEach(function(done: Function): void {
        sandbox.stub(child_process, 'execFile', function(arg: any, secondArg: any, callback: Function): void {
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

    it('should use default args while executing raspistill command', (done: Function) => {
        const camera = new DefaultCamera();

        camera.takePhoto();

        const args: Array<any> = child_process.execFile.args[0];

        expect(args[0]).to.eql('raspistill');
        expect(args[1]).to.eql(['-n', '-e', 'jpg', '-o', args[1][4]]); // TODO path check

        done();
    });

    it('should apply custom args raspistill command', (done: Function) => {
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

        const args: Array<any> = child_process.execFile.args[0];
        const secondCallArgs: Array<any> = child_process.execFile.args[1];

        expect(args[0]).to.eql('raspistill');
        expect(args[1]).to.eql(['-vf', '-hf', '-e', 'png', '-o', PHOTOS_DIR + '/test/foo.png']);
        expect(secondCallArgs[0]).to.eql('raspistill');
        expect(secondCallArgs[1]).to.eql(['-vf', '-hf', '-e', 'png', '-o', PHOTOS_DIR + '/test/test.png']);

        done();
    });

    it('should take photo', (done: Function) => {
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

    it('should take photo with same name', (done: Function) => {
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

    afterEach(function(): void {
        sandbox.restore();
    });

    after(function(done: Function): void {
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