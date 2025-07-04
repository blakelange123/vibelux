import { promises as fs } from 'fs'
import path from 'path'

export interface ButtonInfo {
  file: string
  line: number
  type: 'button' | 'link' | 'custom'
  text?: string
  onClick?: boolean
  href?: boolean
  disabled?: boolean
  ariaLabel?: string
  className?: string
  issues: string[]
}

export async function auditButtons(directory: string): Promise<ButtonInfo[]> {
  const buttons: ButtonInfo[] = []
  
  async function scanDirectory(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
          await scanDirectory(fullPath)
        }
      } else if (entry.isFile() && ['.tsx', '.jsx'].includes(path.extname(entry.name))) {
        await scanFile(fullPath)
      }
    }
  }
  
  async function scanFile(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8')
    const lines = content.split('\n')
    
    // Patterns to match buttons
    const buttonPatterns = [
      /<button\b[^>]*>/gi,
      /<Button\b[^>]*>/gi,
      /<IconButton\b[^>]*>/gi,
      /<Link\b[^>]*>/gi,
      /<a\b[^>]*>/gi,
    ]
    
    lines.forEach((line, index) => {
      buttonPatterns.forEach(pattern => {
        const matches = line.matchAll(pattern)
        
        for (const match of matches) {
          const buttonStr = match[0]
          const buttonInfo: ButtonInfo = {
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
            type: buttonStr.includes('<a') || buttonStr.includes('<Link') ? 'link' : 'button',
            onClick: /onClick/.test(buttonStr),
            href: /href/.test(buttonStr),
            disabled: /disabled/.test(buttonStr),
            ariaLabel: extractAttribute(buttonStr, 'aria-label') || extractAttribute(buttonStr, 'ariaLabel'),
            className: extractAttribute(buttonStr, 'className'),
            issues: []
          }
          
          // Extract button text if possible
          const textMatch = line.match(new RegExp(`${pattern.source}([^<]*)<`, 'i'))
          if (textMatch) {
            buttonInfo.text = textMatch[1].trim()
          }
          
          // Check for common issues
          if (buttonInfo.type === 'button' && !buttonInfo.onClick && !buttonInfo.disabled) {
            buttonInfo.issues.push('Button missing onClick handler')
          }
          
          if (buttonInfo.type === 'link' && !buttonInfo.href) {
            buttonInfo.issues.push('Link missing href')
          }
          
          if (!buttonInfo.ariaLabel && !buttonInfo.text) {
            buttonInfo.issues.push('Missing accessible label')
          }
          
          if (buttonInfo.onClick && line.includes('onClick={() => {}}')) {
            buttonInfo.issues.push('Empty onClick handler')
          }
          
          buttons.push(buttonInfo)
        }
      });
    });
  }
  
  function extractAttribute(tag: string, attribute: string): string | undefined {
    const match = tag.match(new RegExp(`${attribute}=["']([^"']+)["']`))
    return match ? match[1] : undefined
  }
  
  await scanDirectory(directory)
  return buttons
}

export function generateAuditReport(buttons: ButtonInfo[]): string {
  const totalButtons = buttons.length
  const buttonsWithIssues = buttons.filter(b => b.issues.length > 0)
  const issuesByType: Record<string, number> = {}
  
  buttonsWithIssues.forEach(button => {
    button.issues.forEach(issue => {
      issuesByType[issue] = (issuesByType[issue] || 0) + 1
    })
  })
  
  let report = `# Button Functionality Audit Report\n\n`
  report += `## Summary\n`
  report += `- Total buttons found: ${totalButtons}\n`
  report += `- Buttons with issues: ${buttonsWithIssues.length}\n`
  report += `- Success rate: ${((totalButtons - buttonsWithIssues.length) / totalButtons * 100).toFixed(1)}%\n\n`
  
  report += `## Issues by Type\n`
  Object.entries(issuesByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([issue, count]) => {
      report += `- ${issue}: ${count} occurrences\n`
    })
  
  report += `\n## Detailed Issues\n\n`
  
  const fileGroups = buttonsWithIssues.reduce((acc, button) => {
    if (!acc[button.file]) acc[button.file] = []
    acc[button.file].push(button)
    return acc
  }, {} as Record<string, ButtonInfo[]>)
  
  Object.entries(fileGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([file, buttons]) => {
      report += `### ${file}\n`
      buttons.forEach(button => {
        report += `- Line ${button.line}: ${button.type}${button.text ? ` "${button.text}"` : ''}\n`
        button.issues.forEach(issue => {
          report += `  - ⚠️ ${issue}\n`
        })
      })
      report += '\n'
    })
  
  return report
}

export async function runButtonAudit(srcPath: string = './src'): Promise<void> {
  
  try {
    const buttons = await auditButtons(srcPath)
    const report = generateAuditReport(buttons)
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'button-audit-report.md')
    await fs.writeFile(reportPath, report)
    
    
    // Return summary for programmatic use
    const buttonsWithIssues = buttons.filter(b => b.issues.length > 0)
    if (buttonsWithIssues.length > 0) {
      process.exit(1)
    } else {
      // All buttons pass accessibility audit
    }
  } catch (error) {
    console.error('❌ Audit failed:', error)
    process.exit(1)
  }
}