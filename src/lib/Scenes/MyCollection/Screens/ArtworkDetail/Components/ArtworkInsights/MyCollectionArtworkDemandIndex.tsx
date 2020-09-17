import { MyCollectionArtworkDemandIndex_marketPriceInsights } from "__generated__/MyCollectionArtworkDemandIndex_marketPriceInsights.graphql"
import { ScreenMargin } from "lib/Scenes/MyCollection/Components/ScreenMargin"
import { Box, Flex, InfoCircleIcon, Spacer, Text } from "palette"
import React from "react"
import LinearGradient from "react-native-linear-gradient"
import { createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components/native"

interface MyCollectionArtworkDemandIndexProps {
  marketPriceInsights: MyCollectionArtworkDemandIndex_marketPriceInsights
}

const MyCollectionArtworkDemandIndex: React.FC<MyCollectionArtworkDemandIndexProps> = (_props) => {
  return (
    <ScreenMargin>
      <Flex flexDirection="row">
        <Text variant="mediumText" mr={0.5}>
          Demand index
        </Text>
        <InfoCircleIcon />
      </Flex>
      <Box>
        <Text variant="largeTitle" color="purple100">
          8.23
        </Text>
      </Box>
      <Flex flexDirection="row" justifyContent="space-between">
        <Text>0.0</Text>
        <Box>
          <ProgressBar colors={["rgba(255, 255, 255, 0)", "rgba(0, 0, 0, 1)"]} />
        </Box>
        <Text>Progress bar..</Text>
        <Text>10.0</Text>
      </Flex>

      <Spacer my={1} />

      <Box>
        <Text>Strong demand (6.0–8.5)</Text>
        <Text color="black60">
          Demand is higher than the supply available in the market and sale price exceeds estimates.
        </Text>
      </Box>
    </ScreenMargin>
  )
}

export const MyCollectionArtworkDemandIndexFragmentContainer = createFragmentContainer(MyCollectionArtworkDemandIndex, {
  marketPriceInsights: graphql`
    fragment MyCollectionArtworkDemandIndex_marketPriceInsights on MarketPriceInsights {
      annualLotsSold
    }
  `,
})

const ProgressBar = styled(LinearGradient)`
  width: 100%;
  height: 20px;
`
