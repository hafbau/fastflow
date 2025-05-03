import { BaseCommand } from './base'

export default class Test extends BaseCommand {
  static description = 'Test command'

  async run(): Promise<void> {
    console.log('Test command running successfully!')
  }
} 