import {getInput, setFailed} from '@actions/core'
import {exec} from '@actions/exec'

function printCommitIdsCommandArgs(maxBehindBase: number, branch?: string) {
  const commandArgs = ['log']
  if (branch) {
    commandArgs.push(branch)
  }
  commandArgs.push('-n', String(maxBehindBase), '--pretty=oneline', '--pretty=format:"%H"')
  return commandArgs
}

function stdoutListeners() {
  let ref = ''
  return {
    get output() {
      return ref.split('\n')
    },
    listeners: {
      stdout(data: Buffer) {
        ref += data.toString('utf-8').replace(/"/g, '')
      }
    }
  }
}

async function run(): Promise<void> {
  try {
    const baseRemote: string = getInput('remote') || 'origin'
    const baseBranchName: string = getInput('base') || 'main'
    const maxBehindBaseStr: string = getInput('max-behind-base') || '100'
    const maxBehindBase = Number(maxBehindBaseStr)

    const baseBranch = baseRemote + '/' + baseBranchName

    if (!maxBehindBase) {
      setFailed('max-behind-base must be an integer greater than 0')
      return
    }

    const currentCommitListener = stdoutListeners()
    const currentCommitArgs = printCommitIdsCommandArgs(maxBehindBase)
    await exec('git', currentCommitArgs, {listeners: currentCommitListener.listeners})

    console.log('\n\n\n')
    console.log('currentCommitIds', currentCommitListener.output)

    const baseCommitListener = stdoutListeners()
    const baseCommitArgs = printCommitIdsCommandArgs(1, baseBranch)
    await exec('git', baseCommitArgs, {listeners: baseCommitListener.listeners})

    if (!currentCommitListener.output.includes(baseCommitListener.output[0])) {
      setFailed(`The current branch must be rebase from the ${baseBranch} branch`)
    }
  } catch (error) {
    setFailed(error.message)
  }
}

run()
