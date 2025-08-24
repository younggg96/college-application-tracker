import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample universities
  const universities = [
    {
      name: "Harvard University",
      country: "United States",
      state: "Massachusetts",
      city: "Cambridge",
      usNewsRanking: 2,
      acceptanceRate: 3.4,
      applicationSystem: "Common App",
      tuitionInState: 54269,
      tuitionOutState: 54269,
      applicationFee: 75,
      deadlines: JSON.stringify({
        early_action: "2024-11-01",
        regular_decision: "2025-01-01"
      })
    },
    {
      name: "Stanford University",
      country: "United States",
      state: "California",
      city: "Stanford",
      usNewsRanking: 3,
      acceptanceRate: 3.9,
      applicationSystem: "Common App",
      tuitionInState: 56169,
      tuitionOutState: 56169,
      applicationFee: 90,
      deadlines: JSON.stringify({
        early_action: "2024-11-01",
        regular_decision: "2025-01-02"
      })
    },
    {
      name: "Massachusetts Institute of Technology",
      country: "United States",
      state: "Massachusetts",
      city: "Cambridge",
      usNewsRanking: 2,
      acceptanceRate: 4.1,
      applicationSystem: "Direct",
      tuitionInState: 53790,
      tuitionOutState: 53790,
      applicationFee: 75,
      deadlines: JSON.stringify({
        early_action: "2024-11-01",
        regular_decision: "2025-01-01"
      })
    },
    {
      name: "University of California, Berkeley",
      country: "United States",
      state: "California",
      city: "Berkeley",
      usNewsRanking: 20,
      acceptanceRate: 14.5,
      applicationSystem: "UC Application",
      tuitionInState: 14226,
      tuitionOutState: 44008,
      applicationFee: 70,
      deadlines: JSON.stringify({
        regular_decision: "2024-11-30"
      })
    },
    {
      name: "University of California, Los Angeles",
      country: "United States",
      state: "California",
      city: "Los Angeles",
      usNewsRanking: 20,
      acceptanceRate: 10.8,
      applicationSystem: "UC Application",
      tuitionInState: 13804,
      tuitionOutState: 43473,
      applicationFee: 70,
      deadlines: JSON.stringify({
        regular_decision: "2024-11-30"
      })
    },
    {
      name: "Princeton University",
      country: "United States",
      state: "New Jersey",
      city: "Princeton",
      usNewsRanking: 1,
      acceptanceRate: 5.8,
      applicationSystem: "Common App",
      tuitionInState: 56010,
      tuitionOutState: 56010,
      applicationFee: 65,
      deadlines: JSON.stringify({
        early_decision: "2024-11-01",
        regular_decision: "2025-01-01"
      })
    },
    {
      name: "Yale University",
      country: "United States",
      state: "Connecticut",
      city: "New Haven",
      usNewsRanking: 5,
      acceptanceRate: 4.6,
      applicationSystem: "Common App",
      tuitionInState: 62250,
      tuitionOutState: 62250,
      applicationFee: 80,
      deadlines: JSON.stringify({
        early_action: "2024-11-01",
        regular_decision: "2025-01-02"
      })
    },
    {
      name: "Columbia University",
      country: "United States",
      state: "New York",
      city: "New York",
      usNewsRanking: 12,
      acceptanceRate: 3.9,
      applicationSystem: "Common App",
      tuitionInState: 65524,
      tuitionOutState: 65524,
      applicationFee: 85,
      deadlines: JSON.stringify({
        early_decision: "2024-11-01",
        regular_decision: "2025-01-01"
      })
    },
    {
      name: "University of Chicago",
      country: "United States",
      state: "Illinois",
      city: "Chicago",
      usNewsRanking: 6,
      acceptanceRate: 7.4,
      applicationSystem: "Common App",
      tuitionInState: 62940,
      tuitionOutState: 62940,
      applicationFee: 75,
      deadlines: JSON.stringify({
        early_decision: "2024-11-01",
        early_action: "2024-11-01",
        regular_decision: "2025-01-02"
      })
    },
    {
      name: "University of Pennsylvania",
      country: "United States",
      state: "Pennsylvania",
      city: "Philadelphia",
      usNewsRanking: 6,
      acceptanceRate: 5.9,
      applicationSystem: "Common App",
      tuitionInState: 63452,
      tuitionOutState: 63452,
      applicationFee: 75,
      deadlines: JSON.stringify({
        early_decision: "2024-11-01",
        regular_decision: "2025-01-05"
      })
    }
  ]

  // Clear existing universities first
  await prisma.university.deleteMany({})
  
  for (const uni of universities) {
    await prisma.university.create({
      data: uni
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
