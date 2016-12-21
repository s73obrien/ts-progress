"use strict";

import * as chai from 'chai';
const Progress = require('../src/progress');
process.setMaxListeners(0);

let expect = chai.expect;

function helper(stdout, fn) {
    let original = process.stdout.write;

    function restore() {
        process.stdout.write = original;
    }

    process.stdout.write = (str, encoding?, cb?) =>{
        stdout.push(str);
        return true;
    };

    fn();

    restore();

    return filterStdout(stdout);
}

function filterStdout(stdout): string[]{
    return stdout.filter(str =>{
        return typeof str !== 'object'
    }).join('').trim().split('\r\n');

}

describe('Progress', () => {

    it('default', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 2});
            progress.update();
            progress.update();
        });

        expect(stdout.length).equal(3);
        expect(stdout[0]).equal('Progress:                      | Elapsed: 0.0s | 0%');
        expect(stdout[1]).equal('\rProgress:                      | Elapsed: 0.0s | 50%');
        expect(stdout[2]).equal('\rProgress:                      | Elapsed: 0.0s | 100%');

    });

    it('pattern', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 2, pattern: 'bar: {bar} · {elapsed} · {remaining} · {percent} · {current}/{total}'});
            progress.update();
            progress.update();
        });

        expect(stdout.length).equal(3);
        expect(stdout[0]).equal('bar:                      · 0.0s · 0.0s · 0% · 0/2');
        expect(stdout[1]).equal('\rbar:                      · 0.0s · 0.0s · 50% · 1/2');
        expect(stdout[2]).equal('\rbar:                      · 0.0s · 0.0s · 100% · 2/2');

    });

    it('title', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 1, pattern: 'progress · {bar} · {percent}', title: 'title'});
            progress.update();
        });

        expect(stdout.length).equal(2);
        expect(stdout[0]).equal('title\nprogress ·                      · 0%');
        expect(stdout[1]).equal('\rprogress ·                      · 100%');

    });

    it('update frequency', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 2, pattern: 'progress · {bar} · {percent}', updateFrequency: 100});
            progress.update();
            progress.update();
        });

        expect(stdout.length).equal(2);
        expect(stdout[0]).equal('progress ·                      · 0%');
        expect(stdout[1]).equal('\rprogress ·                      · 100%');

    });

    it('update', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 1, pattern: 'progress · {bar} · {percent}'});
            progress.update();
            progress.update();
            progress.update();
            progress.update();
        });

        expect(stdout.length).equal(2);
        expect(stdout[0]).equal('progress ·                      · 0%');
        expect(stdout[1]).equal('\rprogress ·                      · 100%');

    });


    it('done', function() {

        let stdout = helper([], () =>{
            let progress = Progress.create({total: 2, pattern: 'progress · {bar} · {percent}'});
            progress.done();
        });

        expect(stdout.length).equal(2);
        expect(stdout[0]).equal('progress ·                      · 0%');
        expect(stdout[1]).equal('\rprogress ·                      · 100%');

    });

});