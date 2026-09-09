const fs = require('node:fs');

const patchReadlink = (fn) => {
    return function (...args) {
        const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
        if (cb) {
            return fn.call(fs, ...args, (err, ...res) => {
                if (err && err.code === 'EISDIR') err.code = 'EINVAL';
                cb(err, ...res);
            });
        }
        try {
            return fn.call(fs, ...args);
        } catch (err) {
            if (err && err.code === 'EISDIR') err.code = 'EINVAL';
            throw err;
        }
    };
};

if (fs.readlinkSync) fs.readlinkSync = patchReadlink(fs.readlinkSync);
if (fs.readlink) fs.readlink = patchReadlink(fs.readlink);
if (fs.promises?.readlink) {
    const orig = fs.promises.readlink;
    fs.promises.readlink = async function (...args) {
        try {
            return await orig.call(fs.promises, ...args);
        } catch (err) {
            if (err && err.code === 'EISDIR') err.code = 'EINVAL';
            throw err;
        }
    };
}
