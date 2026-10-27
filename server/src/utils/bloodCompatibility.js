/**
 * Blood Compatibility Logic for LifeLink
 * 
 * DISCLAIMER:
 * This software mapping is strictly for donor search coordination and notification.
 * It is NOT a clinical decision-support system. Medical compatibility, cross-matching,
 * and transfusion safety MUST always be performed by a licensed blood bank / hospital.
 */

// Which donor blood groups can donate to a recipient of bloodGroup?
export const COMPATIBLE_DONORS_FOR_RECIPIENT = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

export const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const getEligibleDonorBloodGroups = (recipientBloodGroup, strictMatchOnly = false) => {
  if (strictMatchOnly) {
    return [recipientBloodGroup];
  }
  return COMPATIBLE_DONORS_FOR_RECIPIENT[recipientBloodGroup] || [recipientBloodGroup];
};
