/**
 * Type declaration for the 'ms' module
 * This fixes compatibility issues with @types/jsonwebtoken
 */

declare module 'ms' {
  type StringValue = string;
  
  /**
   * Parse or format the given value
   * @param value - The string or number to convert
   * @param options - Options for the conversion
   * @returns The parsed milliseconds or formatted string
   */
  function ms(value: string | number, options?: { long?: boolean }): number | string;
  
  // Export the StringValue type as a named export
  namespace ms {
    export { StringValue };
  }
  
  export = ms;
}