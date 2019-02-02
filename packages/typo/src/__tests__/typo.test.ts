import buildRunner from '../index';

describe('typo', () => {
  describe('good', () => {
    const path = __dirname + '/fixtures/good.ts';
    const runner = buildRunner((r) => ({result: r}), (r) => ({result: r}));

    it('does not find any issues', async () => {
      const { result } = await runner({
        testPath: path,
        config: {
          rootDir: '',
        }
      });

      let errorMessage = undefined;

      if (result.test) {
        errorMessage = result.test.errorMessage;
      }

      expect(errorMessage).toEqual(undefined);
    })
  })
});
