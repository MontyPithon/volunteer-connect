export function getMatchingEvents(volunteer, events) {
  return events.filter(event => {
    const skillMatch = event.requiredSkills.some(skill =>
      volunteer.skills.includes(skill)
    );
    const dateMatch = volunteer.availability.includes(event.date);
    const locationMatch = event.location.includes(volunteer.city);

    return skillMatch && dateMatch && locationMatch;
  });
}
