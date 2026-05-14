export const mockDogs = [
  {
    id: "1",
    name: "Lupita",
    breed: "Schnauzer miniatura",
    age: 2,
    energy: "alta",
    size: "pequeño",
    distanceKm: 1.2,
    avatar: "🐕",
    photoUrl: "/dogs/lupita.png",
  },
  {
    id: "2",
    name: "Rocky",
    breed: "Bulldog",
    age: 4,
    energy: "media",
    size: "mediano",
    distanceKm: 2.8,
    avatar: "🐶",
    photoUrl: "/dogs/rocky.png",
  },
  {
    id: "3",
    name: "Maya",
    breed: "Border Collie",
    age: 3,
    energy: "alta",
    size: "mediano",
    distanceKm: 0.9,
    avatar: "🐕‍🦺",
    photoUrl: "/dogs/maya.png",
  },
  {
    id: "4",
    name: "Toby",
    breed: "Beagle",
    age: 1,
    energy: "baja",
    size: "pequeño",
    distanceKm: 3.5,
    avatar: "🦮",
    photoUrl: "/dogs/toby.png",
  },
];

export const featuredDog = {
  id: "featured-1",
  name: "lupita",
  age: 2,
  breed: "Schnauzer miniatura",
  energy: "alta",
  avatar: "🐶",
  badge: "Nuevo",
  photoUrl: mockDogs[0].photoUrl,
};

export function getCompatibility(dog, preferredEnergy) {
  let score = 70;
  if (preferredEnergy !== "todas") {
    score += dog.energy === preferredEnergy ? 20 : -8;
  }
  if (dog.distanceKm <= 1.5) score += 8;
  if (dog.age <= 3) score += 4;
  if (score > 99) return 99;
  if (score < 45) return 45;
  return score;
}
