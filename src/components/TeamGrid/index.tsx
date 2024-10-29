import { Cards } from "@cloudscape-design/components";
import React from "react";

interface TeamsGridProps {
    teams: Record<string, any>[]
    selectedItems: Record<string, any>[]
    setSelectedItems: React.Dispatch<React.SetStateAction<Record<string, any>[]>>
}

export const TeamsGrid = ({teams, selectedItems, setSelectedItems}: TeamsGridProps) => {
  const items = teams.map(team => {
    return {
        name: team.displayName,
        logo: <img src={team.logos[0].href} width={200} height={200} alt={team.displayName}/>,
        record: team.recordData.items.length > 0 ? team.recordData.items[0].displayValue : "0-0",
        teamInfo: team
    }}
    )
  return (
    <Cards
    selectedItems={selectedItems}
    selectionType="single"
    onSelectionChange={({detail}) => {setSelectedItems(detail?.selectedItems)
    }}
      cardDefinition={
        {
            header: item => (item.name),
            sections: [
                {
                    id: "logo",
                    content: item => item.logo
                },
                {
                    id: "record",
                    header: "Record",
                    content: item => item.record
                }
            ]
        }
    }
      items={items.filter(item => item !== undefined)}
      cardsPerRow={[{ cards: 3}]}
      trackBy={"name"}
    />
  )
}