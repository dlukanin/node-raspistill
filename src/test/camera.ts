import {expect} from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as child_process from 'child_process';
import {DefaultCamera} from '../lib/camera/default';

let sandbox = sinon.sandbox.create();

describe('camera', function(): void {
    const PHOTOS_DIR = './photos/';
    const FILE_NAME = 'test.jpg';
    const FILE_DATA = '111';

    const camera = new DefaultCamera({outputDir: PHOTOS_DIR});

    this.timeout(4000);

    beforeEach(function(done: Function): void {
        sandbox.stub(child_process, 'execFile', function(arg: any, secondArg: any, callback: Function): void {
            fs.mkdir(PHOTOS_DIR, (err: any) => {
                // NOTE directory can exists and it's ok, so we don't try to fail-first here
                fs.writeFile(PHOTOS_DIR + FILE_NAME, FILE_DATA, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, 'success');
                    }
                });
            });
        });
        done();
    });

    it('should take photo', (done: Function) => {
        camera.takePhoto(FILE_NAME)
            .then((data: any) => {
                expect(data).to.be.instanceOf(Buffer);
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
        fs.unlink(PHOTOS_DIR + FILE_NAME, (err) => {
            if (err) {
                done(err);
            }
            done();
        });
    });
});