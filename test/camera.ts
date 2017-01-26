import {expect} from 'chai';
import * as fs from 'fs';
import * as sinon from 'sinon';
import * as child_process from 'child_process';
import {DefaultCamera} from '../src/camera/default';

let sandbox = sinon.sandbox.create();

describe('camera', function() {
    const PHOTOS_DIR = './photos/';
    const FILE_NAME = 'test.jpg';
    const FILE_DATA = '111';

    const camera = new DefaultCamera({outputDir: PHOTOS_DIR});

    beforeEach(function() {
        sandbox.stub(child_process, 'execFile', function(arg, secondArg, callback) {
            try {
                fs.mkdirSync(PHOTOS_DIR);
            } catch (error) {

            }
            fs.writeFileSync(PHOTOS_DIR + FILE_NAME, FILE_DATA);
            callback(null, 'success');
        });
    });

    it('should take photo', function(done) {
        camera.takePhoto(FILE_NAME)
            .then((data) => {
                expect(data).to.be.instanceOf(Buffer);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    afterEach(function(){
        sandbox.restore();
    });
});