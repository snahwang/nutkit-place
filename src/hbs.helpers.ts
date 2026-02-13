import * as hbs from 'hbs';

export function registerHbsHelpers() {
  hbs.registerHelper('ifEq', function (a: unknown, b: unknown, options: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (a === b) return options.fn(this);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return options.inverse(this);
  });
}
