import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ShamirService {
  private readonly logger = new Logger(ShamirService.name);

  /**
   * Split a secret into multiple shards using Shamir's Secret Sharing
   * @param secret The secret to split
   * @param numShards The number of shards to create
   * @param threshold The minimum number of shards required to reconstruct the secret
   * @returns An array of shards
   */
  splitSecret(secret: string, numShards: number, threshold: number): { index: number; value: string }[] {
    try {
      if (numShards < threshold) {
        throw new Error('Number of shards must be greater than or equal to threshold');
      }

      if (threshold < 2) {
        throw new Error('Threshold must be at least 2');
      }

      // Convert secret to a buffer
      const secretBuffer = Buffer.from(secret);

      // Generate random coefficients for the polynomial
      const coefficients = [];
      for (let i = 0; i < threshold - 1; i++) {
        coefficients.push(crypto.randomBytes(secretBuffer.length));
      }

      // Generate shards
      const shards = [];
      for (let i = 1; i <= numShards; i++) {
        const x = i;
        const y = this.evaluatePolynomial(secretBuffer, coefficients, x);
        shards.push({
          index: x,
          value: Buffer.concat([Buffer.from([x]), y]).toString('base64'),
        });
      }

      return shards;
    } catch (error) {
      this.logger.error(`Failed to split secret: ${error.message}`);
      throw error;
    }
  }

  /**
   * Combine shards to reconstruct the original secret
   * @param shards The shards to combine
   * @param threshold The minimum number of shards required to reconstruct the secret
   * @returns The reconstructed secret
   */
  combineShards(shards: { index: number; value: string }[], threshold: number): string {
    try {
      if (shards.length < threshold) {
        throw new Error(`Not enough shards. Need ${threshold}, have ${shards.length}`);
      }

      // Decode shards
      const decodedShards = shards.map((shard) => {
        const buffer = Buffer.from(shard.value, 'base64');
        return {
          x: buffer[0],
          y: buffer.slice(1),
        };
      });

      // Use Lagrange interpolation to reconstruct the secret
      const secret = this.lagrangeInterpolation(decodedShards, threshold);

      return secret.toString();
    } catch (error) {
      this.logger.error(`Failed to combine shards: ${error.message}`);
      throw error;
    }
  }

  /**
   * Evaluate a polynomial at a given point
   * @param secret The secret (constant term of the polynomial)
   * @param coefficients The coefficients of the polynomial
   * @param x The point at which to evaluate the polynomial
   * @returns The result of the polynomial evaluation
   */
  private evaluatePolynomial(secret: Buffer, coefficients: Buffer[], x: number): Buffer {
    const result = Buffer.alloc(secret.length);
    secret.copy(result);

    for (let i = 0; i < coefficients.length; i++) {
      const term = Buffer.alloc(coefficients[i].length);
      coefficients[i].copy(term);

      // Multiply term by x^(i+1)
      let power = x;
      for (let j = 0; j < i; j++) {
        power = (power * x) % 256;
      }

      for (let j = 0; j < term.length; j++) {
        term[j] = (term[j] * power) % 256;
      }

      // Add term to result
      for (let j = 0; j < result.length; j++) {
        result[j] = (result[j] + term[j]) % 256;
      }
    }

    return result;
  }

  /**
   * Use Lagrange interpolation to reconstruct the secret
   * @param shards The shards to use for interpolation
   * @param threshold The minimum number of shards required
   * @returns The reconstructed secret
   */
  private lagrangeInterpolation(shards: { x: number; y: Buffer }[], threshold: number): Buffer {
    // Use the first 'threshold' shards
    const usedShards = shards.slice(0, threshold);
    const secretLength = usedShards[0].y.length;
    const result = Buffer.alloc(secretLength, 0);

    for (let i = 0; i < threshold; i++) {
      const { x: xi, y: yi } = usedShards[i];
      let numerator = 1;
      let denominator = 1;

      for (let j = 0; j < threshold; j++) {
        if (i === j) continue;

        const xj = usedShards[j].x;
        numerator = (numerator * xj) % 256;
        denominator = (denominator * ((xj - xi + 256) % 256)) % 256;
      }

      const lagrangeCoefficient = (numerator * this.modInverse(denominator, 256)) % 256;

      for (let j = 0; j < secretLength; j++) {
        result[j] = (result[j] + (yi[j] * lagrangeCoefficient) % 256) % 256;
      }
    }

    return result;
  }

  /**
   * Calculate the modular multiplicative inverse
   * @param a The number to find the inverse of
   * @param m The modulus
   * @returns The modular multiplicative inverse
   */
  private modInverse(a: number, m: number): number {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) {
        return x;
      }
    }
    return 1;
  }
}
