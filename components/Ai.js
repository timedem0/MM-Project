export function aiEasy() {

  const choice = Math.floor(Math.random() * 2);
 
  switch (choice) {
    case 0: return 'Nuke';
    case 1: return 'Foot';
    case 2: return 'Roach';
    default: return '';
  }
}

export function aiHard(nukeCount, footCount, roachCount) {

  // initialize the choice variable
  let choice = '';

  // calculate ratios for each of user's choices
  const sum = nukeCount + footCount + roachCount;
  const nukeRatio = (nukeCount / sum);
  const footRatio = (footCount / sum);
  const roachRatio = (roachCount / sum);

  // build the array
  const ratioArray = [
    { name: 'Nuke', value: nukeRatio },
    { name: 'Foot', value: footRatio },
    { name: 'Roach', value: roachRatio},
  ];

  // sort the array
  ratioArray.sort((a, b) => a.value - b.value);

  // ai throws a die
  const rnd = Math.random();

  // calculate the AI choice (biased choice based on player history with random element)
  if (rnd < ratioArray[0].value) {
    // lowest chance to happen
    if (ratioArray[0].name == 'Nuke') {
      choice = 'Roach';
    } else if (ratioArray[0].name == 'Foot') {
      choice = 'Nuke';
    } else if (ratioArray[0].name == 'Roach') {
      choice = 'Foot';
    };
  } else if (rnd < ratioArray[1].value) {
    // medium chance to happen
    if (ratioArray[1].name == 'Nuke') {
      choice = 'Roach';
    } else if (ratioArray[1].name == 'Foot') {
      choice = 'Nuke';
    } else if (ratioArray[1].name == 'Roach') {
      choice = 'Foot';
    };
  } else {
    // highest chance to happen, preferred choice
    if (ratioArray[2].name == 'Nuke') {
      choice = 'Roach';
    } else if (ratioArray[2].name == 'Foot') {
      choice = 'Nuke';
    } else if (ratioArray[2].name == 'Roach') {
      choice = 'Foot';
    };
  };

  return choice;
}
