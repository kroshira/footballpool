import React from "react"
import { Button, Container, FlashbarProps, Modal, ModalProps, SpaceBetween, Tiles, TilesProps } from "@cloudscape-design/components"

interface PoolModalProps extends ModalProps {
    week: string
    teams: Record<string, any>
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    setNotifications: React.Dispatch<React.SetStateAction<FlashbarProps.MessageDefinition[]>>
}

export const PoolModal = ({ week, teams, visible, setVisible }: PoolModalProps) => {
    const date = new Date()
    const year = date.getMonth() < 3 ? date.getFullYear() - 1 :date.getFullYear()
    const [loaded, setLoaded] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState<Array<string>>([]);
    const [items, setItems] = React.useState<TilesProps.TilesDefinition[][]>([]);

    const teamsDict: Record<string, any> = {}
    teams.map(team => (
      teamsDict[team.name] = team
    ))

    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify({"Falcons": teamsDict.Falcons})], {type: 'application/json'}
      )
    )

    React.useEffect(() => {
      const fetchData = async () => {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${year}&seasontype=2&week=${week}`
        );
        const data = await response.json();

        const fetchedItems = data.events.map((event) =>
          
          // const commonOpponents = {}
          event.competitions[0].competitors.map((competitor) => {
            // teamsDict[competitor.team.name].eventData.map(
              
            // )
            return {
            label: competitor.team.displayName,
            value: competitor.team.shortDisplayName,
            description: `${competitor.homeAway} team`,
            image: (
              <img
                src={competitor.team.logo}
                alt={competitor.team.shortDisplayName}
                width={50}
                height={50}
              />
            ),
          }})
      );

        setItems(fetchedItems);
        setSelectedItems(new Array(fetchedItems.length).fill("")); // Initialize selectedItems with empty strings
        setLoaded(true);
      };

      fetchData();
      setLoaded(false); // Reset loaded state
    }, [week, year]); // Refetch items when the week changes

    const handleSelectionChange = (index: number, value: string) => {
      setSelectedItems((currentItems) => {
        const updatedItems = [...currentItems];
        updatedItems[index] = value;
        return updatedItems;
      });
    };

    return (
      <Modal visible={visible} onDismiss={() => setVisible(false)} header="">
        <SpaceBetween direction="vertical" size="s">
          {loaded &&
            items.map((game, index) => (
              <Container key={`game-${index}-week-${week}-container`}>
              <Tiles
                key={`game-${index}-week-${week}`}
                columns={2}
                onChange={({ detail }) => handleSelectionChange(index, detail.value)}
                value={selectedItems[index]}
                items={game}

              />
              </Container>
            ))}
            <Button
                variant="primary"
                download={'team_data.json'}
                href={url}
                >Submit</Button>
        </SpaceBetween>
      </Modal>
    );
};