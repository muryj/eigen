#!/usr/bin/env node

// @ts-check

const { GraphQLClient } = require("graphql-request")
const { values } = require("lodash")
const { exit, stdout } = require("process")

const [userId, token] = [
]

const metaphysics = new GraphQLClient("https://metaphysics-staging.artsy.net/v2", {
  headers: {
    // sd.CURRENT_USER.id and accessToken
    "X-Access-Token": token,
    "X-User-Id": userId,
  },
})

const doIt = async () => {
  const allQueries = values(require("../data/complete.queryMap.json"))
  const allNonTestQueries = allQueries.filter(
    (q) => !q.includes("Test") && !q.includes("Mock") && !q.includes("Fixtures")
  )
  const queries = allNonTestQueries.filter((q) => q.startsWith("query"))
  const queriesWithoutVars = queries.filter((q) => !q.includes("$"))
  const mutations = allNonTestQueries.filter((q) => q.startsWith("mutation"))

  console.warn(`Skipping ${mutations.length} mutations`)
  console.log(`Skipping ${allQueries.length - allNonTestQueries.length} test queries`)

  console.log(`Running ${queriesWithoutVars.length} no-var queries`)
  await Promise.all(
    queriesWithoutVars.map(async (q) => {
      try {
        stdout.write(".")
        const r = await metaphysics.request(q)
        // console.log(JSON.stringify(r))
      } catch (e) {
        console.log("")
        console.error("The following query failed:")
        console.warn(q)
        exit(-1)
      }
    })
  )

  console.log("")
  console.log("done")
  exit(0)
}

doIt()
