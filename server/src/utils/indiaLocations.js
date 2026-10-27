/**
 * India Geographic Dataset for LifeLink (Server)
 * Validates states/UTs and provides automatic coordinate resolution for Indian cities.
 */

export const INDIA_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const DEFAULT_CITY_COORDINATES = {
  // Key hubs
  'mumbai': [72.8777, 19.0760],
  'pune': [73.8567, 18.5204],
  'delhi': [77.2090, 28.6139],
  'new delhi': [77.2090, 28.6139],
  'bengaluru': [77.5946, 12.9716],
  'bangalore': [77.5946, 12.9716],
  'hyderabad': [78.4867, 17.3850],
  'chennai': [80.2707, 13.0827],
  'kolkata': [88.3639, 22.5726],
  'ahmedabad': [72.5714, 23.0225],
  'jaipur': [75.7873, 26.9124],
  'lucknow': [80.9462, 26.8467],
  'kanpur': [80.3319, 26.4499],
  'nagpur': [79.0882, 21.1458],
  'indore': [75.8577, 22.7196],
  'bhopal': [77.4126, 23.2599],
  'patna': [85.1376, 25.5941],
  'surat': [72.8311, 21.1702],
  'vadodara': [73.1812, 22.3072],
  'coimbatore': [76.9558, 11.0168],
  'kochi': [76.2673, 9.9312],
  'chandigarh': [76.7794, 30.7333],
  'guwahati': [91.7362, 26.1445],
  'bhubaneswar': [85.8245, 20.2961],
  'visakhapatnam': [83.2185, 17.6868],
  'ranchi': [85.3096, 23.3441],
  'raipur': [81.6296, 21.2514],
  'dehradun': [78.0322, 30.3165],
  'shimla': [77.1734, 31.1048],
  'srinagar': [74.7973, 34.0837],
  'jammu': [74.8570, 32.7266],
  'panaji': [73.8278, 15.4909],
};

/**
 * Resolve coordinates for a given city name [lng, lat]
 */
export const resolveCoordinatesForCity = (cityName) => {
  if (!cityName) return [73.8567, 18.5204];
  const normalized = cityName.toLowerCase().trim();

  for (const [key, coords] of Object.entries(DEFAULT_CITY_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Fallback to Pune coordinates if not found
  return [73.8567, 18.5204];
};
