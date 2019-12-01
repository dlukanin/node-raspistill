function exec() {
    setTimeout(function () {
        process.stderr.write('ERROR');
    }, 100);
}
exec();