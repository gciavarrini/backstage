/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import { findRootPath } from "@backstage/cli-common/src/paths";
import { generate } from './generate';

jest.mock('./runner', () => ({
  runner: jest.fn().mockImplementation(async (p: string) => {
    console.log('mock path: ', p);
    return [
      {
        relativeDir: p,
        resultText: '',
      },
    ];
  }),
}));

const fs = require('fs-extra');
const yaml = require('js-yaml');
const resolve = require('path').resolve;

const childProcess = require('child_process');
const util = require('util');

jest.mock('fs-extra');
jest.mock('js-yaml');
jest.mock('chalk');
jest.mock('../../../../cli-node');

jest.mock('util', () => {
  const originalModule = jest.requireActual('util');
  // Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mocked baz'),
    promisify: jest.fn(() => 'mocked pro'),
  };
});
jest.mock('path');

jest.mock('child_process', () => {
  return {
    exec: jest.fn(),
  };
});

jest.mock('@backstage/cli-common/src/paths');

describe('generate', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should generate TypeScript file from OpenAPI YAML', async () => {
    const directoryPath = 'path/to/directory';
    const yamlFilePath = resolve(directoryPath, 'src/schema/openapi.yaml');
    const tsFilePath = resolve(directoryPath, 'openapi.ts');

    // Mock the implementation of path.resolve
    (resolve as jest.Mock).mockImplementation((...paths) => paths.join('/'));

    // Mock fs-extra pathExists
    (fs.pathExists as jest.Mock).mockResolvedValue(true);

    // Mock fs-extra readFile
    (fs.readFile as jest.Mock).mockResolvedValue('mocked yaml content');

    const mockPromisify = jest.fn();
    // util.promisify = mockPromisify;
    mockPromisify.mockReturnValue(require('child_process').exec);

    await generate(directoryPath);

    expect(fs.writeFile).toHaveBeenCalledWith(tsFilePath, expect.any(String));
  });
});
