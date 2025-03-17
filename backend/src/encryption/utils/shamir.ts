/**
 * Implementation of Shamir's Secret Sharing algorithm for secure key recovery
 * This allows splitting a secret into multiple shares, where a threshold number
 * of shares is required to reconstruct the original secret.
 */

import * as crypto from 'crypto';

/**
 * Converts a number to a Buffer
 */
function numberToBuffer(num: number): Buffer {
  const hex = num.toString(16).padStart(2, '0');
  return Buffer.from(hex, 'hex');
}

/**
 * Converts a Buffer to a number
 */
function bufferToNumber(buffer: Buffer): number {
  return parseInt(buffer.toString('hex'), 16);
}

/**
 * Evaluates a polynomial at a given point using Horner's method
 * @param coefficients The coefficients of the polynomial
 * @param x The point at which to evaluate the polynomial
 * @param prime The prime modulus
 */
function evaluatePolynomial(coefficients: number[], x: number, prime: number): number {
  let result = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = (result * x + coefficients[i]) % prime;
  }
  return result;
}

/**
 * Generates a random polynomial of degree (threshold - 1) with the secret as the constant term
 * @param secret The secret to share (as a number)
 * @param threshold The minimum number of shares required to reconstruct the secret
 * @param prime The prime modulus
 */
function generatePolynomial(secret: number, threshold: number, prime: number): number[] {
  const coefficients = [secret];
  
  // Generate random coefficients for the polynomial
  for (let i = 1; i < threshold; i++) {
    const randomCoefficient = crypto.randomInt(1, prime);
    coefficients.push(randomCoefficient);
  }
  
  return coefficients;
}

/**
 * Splits a secret into shares using Shamir's Secret Sharing
 * @param secret The secret to split
 * @param numShares The number of shares to generate
 * @param threshold The minimum number of shares required to reconstruct the secret
 * @returns An object mapping share IDs to share values
 */
export function splitSecret(secret: string, numShares: number, threshold: number): Record<string, string> {
  if (numShares < threshold) {
    throw new Error('Number of shares must be greater than or equal to threshold');
  }
  
  if (threshold < 2) {
    throw new Error('Threshold must be at least 2');
  }
  
  // Convert the secret to a Buffer
  const secretBuffer = Buffer.from(secret);
  
  // Process each byte of the secret separately
  const shares: Record<string, Buffer[]> = {};
  
  // Initialize share buffers
  for (let i = 1; i <= numShares; i++) {
    shares[`shard${i}`] = [];
  }
  
  // Use a large prime number (for a finite field)
  const prime = 257; // Prime larger than 256 (byte values)
  
  // Process each byte of the secret
  for (let byteIndex = 0; byteIndex < secretBuffer.length; byteIndex++) {
    const secretByte = secretBuffer[byteIndex];
    
    // Generate a random polynomial with the secret byte as the constant term
    const polynomial = generatePolynomial(secretByte, threshold, prime);
    
    // Generate shares by evaluating the polynomial at different points
    for (let x = 1; x <= numShares; x++) {
      const y = evaluatePolynomial(polynomial, x, prime);
      shares[`shard${x}`].push(numberToBuffer(y));
    }
  }
  
  // Convert share buffers to strings
  const stringShares: Record<string, string> = {};
  for (const [id, shareBytes] of Object.entries(shares)) {
    // Store x value and share bytes
    const shareBuffer = Buffer.concat([numberToBuffer(parseInt(id.replace('shard', ''))), ...shareBytes]);
    stringShares[id] = shareBuffer.toString('hex');
  }
  
  return stringShares;
}

/**
 * Reconstructs a secret from shares using Lagrange interpolation
 * @param shares The shares to use for reconstruction
 * @param threshold The minimum number of shares required to reconstruct the secret
 * @returns The reconstructed secret
 */
export function reconstructSecret(shares: Record<string, string>, threshold: number): string {
  const shareCount = Object.keys(shares).length;
  
  if (shareCount < threshold) {
    throw new Error(`Not enough shares provided. Need at least ${threshold}, but got ${shareCount}`);
  }
  
  // Convert shares from strings to buffers
  const shareBuffers: Record<number, Buffer> = {};
  let secretLength = 0;
  
  for (const [id, shareString] of Object.entries(shares)) {
    const shareBuffer = Buffer.from(shareString, 'hex');
    
    // Extract x value from the first byte
    const x = shareBuffer[0];
    
    // Extract share bytes
    const shareBytes = shareBuffer.slice(1);
    secretLength = shareBytes.length;
    
    shareBuffers[x] = shareBytes;
  }
  
  // Use a large prime number (for a finite field)
  const prime = 257; // Prime larger than 256 (byte values)
  
  // Reconstruct each byte of the secret
  const secretBytes: Buffer[] = [];
  
  for (let byteIndex = 0; byteIndex < secretLength; byteIndex++) {
    // Get the points (x, y) for this byte from each share
    const points: [number, number][] = [];
    
    for (const [x, shareBuffer] of Object.entries(shareBuffers)) {
      const y = bufferToNumber(shareBuffer.slice(byteIndex, byteIndex + 1));
      points.push([parseInt(x), y]);
    }
    
    // Use the first 'threshold' points for interpolation
    const interpolationPoints = points.slice(0, threshold);
    
    // Reconstruct the secret byte using Lagrange interpolation
    let secretByte = 0;
    
    for (let i = 0; i < threshold; i++) {
      const [xi, yi] = interpolationPoints[i];
      
      let lagrangeTerm = yi;
      
      for (let j = 0; j < threshold; j++) {
        if (i !== j) {
          const [xj] = interpolationPoints[j];
          
          // Calculate the Lagrange basis polynomial term
          let numerator = (0 - xj) % prime;
          if (numerator < 0) numerator += prime;
          
          let denominator = (xi - xj) % prime;
          if (denominator < 0) denominator += prime;
          
          // Calculate the modular multiplicative inverse of the denominator
          let inverse = 1;
          for (let k = 1; k < prime; k++) {
            if ((denominator * k) % prime === 1) {
              inverse = k;
              break;
            }
          }
          
          // Multiply the Lagrange term by this basis term
          lagrangeTerm = (lagrangeTerm * numerator * inverse) % prime;
          if (lagrangeTerm < 0) lagrangeTerm += prime;
        }
      }
      
      // Add this Lagrange term to the result
      secretByte = (secretByte + lagrangeTerm) % prime;
    }
    
    secretBytes.push(numberToBuffer(secretByte));
  }
  
  // Combine the secret bytes and convert to a string
  const secretBuffer = Buffer.concat(secretBytes);
  return secretBuffer.toString();
}
