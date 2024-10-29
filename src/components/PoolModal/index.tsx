import React from "react"
import { Button, FlashbarProps, Modal, ModalProps, SpaceBetween, Tiles, TilesProps } from "@cloudscape-design/components"

interface PoolModalProps extends ModalProps {
    week: string
    teams: Record<string, any>
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    setNotifications: React.Dispatch<React.SetStateAction<FlashbarProps.MessageDefinition[]>>
}

export const PoolModal = ({ week, visible, setVisible }: PoolModalProps) => {
    const year = new Date().getFullYear();
    const [loaded, setLoaded] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState<Array<string>>([]);
    const [items, setItems] = React.useState<TilesProps.TilesDefinition[][]>([]);

    React.useEffect(() => {
      const fetchData = async () => {
        const response = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${year}&seasontype=2&week=${week}`
        );
        const data = await response.json();

        const fetchedItems = data.events.map((event) =>
          event.competitions[0].competitors.map((competitor) => ({
            label: competitor.team.displayName,
            value: competitor.team.shortDisplayName,
            image: (
              <img
                src={competitor.team.logo}
                alt={competitor.team.shortDisplayName}
                width={100}
                height={100}
              />
            ),
          }))
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
              <Tiles
                key={`game-${index}-week-${week}`}
                columns={2}
                onChange={({ detail }) => handleSelectionChange(index, detail.value)}
                value={selectedItems[index]}
                items={game}
              />
            ))}
            <Button
                variant="primary"
                >Submit</Button>
        </SpaceBetween>
      </Modal>
    );
};