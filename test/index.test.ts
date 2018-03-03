import * as del from 'del';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as assert from 'power-assert';
import TsHelper from '../src/';

function sleep(time) {
  return new Promise(res => setTimeout(res, time));
}

describe('index.ts', () => {
  before(() => {
    del.sync(path.resolve(__dirname, './fixtures/app/typings'));
  });

  it('should works without error', async () => {
    const dir = path.resolve(__dirname, './fixtures/app/app/service/test');
    mkdirp.sync(dir);

    const tsHelper = new TsHelper({
      cwd: path.resolve(__dirname, './fixtures/app'),
    });

    await sleep(1000);

    assert(!!tsHelper.config);
    assert(tsHelper.config.framework === 'egg');

    assert(fs.existsSync(path.resolve(__dirname, './fixtures/app/typings/app/controller/index.d.ts')));

    const dts = path.resolve(__dirname, './fixtures/app/typings/app/service/index.d.ts');
    fs.writeFileSync(path.resolve(dir, 'test.ts'), '');
    fs.writeFileSync(path.resolve(dir, 'test-two.ts'), '');

    await sleep(2000);

    del.sync(dir);
    const content = fs.readFileSync(dts, { encoding: 'utf-8' });
    assert(content.includes('service/test/test'));
    assert(content.includes('service/test/test-two'));
    assert(content.includes('test: TestTest'));
    assert(content.includes('testTwo: TestTestTwo'));

    await sleep(2000);

    assert(!fs.existsSync(dts));
  });

  it('should support read framework by package.json', () => {
    let tsHelper = new TsHelper({
      cwd: path.resolve(__dirname, './fixtures/app3'),
      watch: false,
    });

    assert(tsHelper.config.framework === 'egg');

    tsHelper = new TsHelper({
      cwd: path.resolve(__dirname, './fixtures/app2'),
      watch: false,
    });

    assert(tsHelper.config.framework === 'larva');
  });
});