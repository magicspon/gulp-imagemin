import fs from 'fs';
import path from 'path';
import imageminPngquant from 'imagemin-pngquant';
import pify from 'pify';
import Vinyl from 'vinyl';
import getStream from 'get-stream';
import test from 'ava';
import m from '.';

const fsP = pify(fs);

const createFixture = async plugins => {
	const buf = await fsP.readFile('fixture.png');
	const stream = m(plugins);

	stream.end(new Vinyl({
		path: path.join(__dirname, 'fixture.png'),
		contents: buf
	}));

	return {buf, stream};
};

test('minify images', async t => {
	const {buf, stream} = await createFixture();
	const file = await getStream.array(stream);

	t.true(file[0].contents.length < buf.length);
});

test('use custom plugins', async t => {
	const {stream} = await createFixture([imageminPngquant()]);
	const compareStream = (await createFixture()).stream;
	const file = await getStream.array(stream);
	const compareFile = await getStream.array(compareStream);

	t.true(file[0].contents.length < compareFile[0].contents.length);
});

test('skip unsupported images', async t => {
	const stream = m();
	stream.end(new Vinyl({path: path.join(__dirname, 'fixture.bmp')}));
	const file = await getStream.array(stream);

	t.is(file[0].contents, null);
});
