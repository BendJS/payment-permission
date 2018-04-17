export function notification(primaryText, secondaryText='#', secondaryTextLink='', duration=3000, target='_blank') {
  M.toast({html:`<span class="round">${primaryText}</span><a href="${secondaryTextLink}" target=${target} class="btn-flat toast-action">${secondaryText}</a>`, duration, classes:'rounded meta-notification'});
}

