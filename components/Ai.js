export function getComputerChoice() {

  const choice = Math.floor(Math.random() * 2);

  switch (choice) {
    case 0: return 'Nuke';
    case 1: return 'Foot';
    case 2: return 'Roach';
    default: return '';
  }
}
