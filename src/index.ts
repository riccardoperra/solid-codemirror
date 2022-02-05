export interface Test {
  property: string;
}

export const test = (): Test => ({
  property: 'test',
});
