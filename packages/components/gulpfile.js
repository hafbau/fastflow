import gulp from 'gulp';
const { src, dest, series } = gulp;

function copyIcons() {
    return src(['nodes/**/*.{jpg,png,svg}']).pipe(dest('dist/nodes'));
}

export default copyIcons;
