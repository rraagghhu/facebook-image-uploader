const chalk = require('chalk')

class ProgressTracker {
  constructor(total) {
    this.total = total
    this.current = 0
    this.startTime = Date.now()
    this.lastMessage = ''
    this.isRunning = true
    this.update('Initializing...', 0)
  }

  update(message, increment = 0) {
    if (!this.isRunning) return

    this.current += increment
    const percentage = Math.round((this.current / this.total) * 100)
    const elapsed = (Date.now() - this.startTime) / 1000
    const rate = this.current / elapsed
    const remaining = (this.total - this.current) / rate

    const progressMessage = `${message} (${percentage}%) - ${this.current}/${
      this.total
    } images - ${this.formatTime(remaining)} remaining`

    // Clear the previous line and write the new one
    process.stdout.write('\r' + ' '.repeat(this.lastMessage.length))
    process.stdout.write('\r' + progressMessage)
    this.lastMessage = progressMessage
  }

  success(message) {
    this.isRunning = false
    process.stdout.write('\n' + chalk.green('✓ ' + message) + '\n')
  }

  error(message) {
    this.isRunning = false
    process.stdout.write('\n' + chalk.red('✗ ' + message) + '\n')
  }

  info(message) {
    this.isRunning = false
    process.stdout.write('\n' + chalk.blue('ℹ ' + message) + '\n')
  }

  formatTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  stop() {
    this.isRunning = false
    process.stdout.write('\n')
  }
}

module.exports = ProgressTracker
