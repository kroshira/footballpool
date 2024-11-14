import React from "react"
import { Cards, KeyValuePairs, Modal, ModalProps, Pagination } from "@cloudscape-design/components"
import { useCollection } from "@cloudscape-design/collection-hooks"


interface LeagueStatsModalProps extends ModalProps {
    teams: Record<string, any>
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const LeagueStatsModal = ({ teams, visible, setVisible }: LeagueStatsModalProps) => {
    const stats = {}
    teams.forEach(team => {
        try {
            team.statsData.splits.categories.forEach(category => {
                if (!stats[category.displayName]) {
                    stats[category.displayName] = {}
                }
                category.stats.forEach(stat => {
                    if (!stats[category.displayName][stat.name]) {
                        stats[category.displayName][stat.name] = {
                            name: stat.displayName,
                            description: stat.description,
                            values: [stat.value]
                        };
                    } else {
                        stats[category.displayName][stat.name].values.push(stat.value);
                    }
                });
            });
        }
        catch {
            // console.log(team)
        }
    });
    const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const cardItems = Object.keys(stats).map(category => {
        return {
            name: category,
            values: <KeyValuePairs
                columns={4}
                items={
                    Object.keys(stats[category]).map(key => {
                         return {
                             type: "group",
                             title: stats[category][key].name,
                             items: [
                                 {
                                     label: "League Average",
                                     value: average(stats[category][key].values)
                                 },
                                 {
                                     label: "League Minimum",
                                     value: Math.min(...stats[category][key].values)
                                 },
                                 {
                                     label: "League Maximum",
                                     value: Math.max(...stats[category][key].values)
                                 }
                             ]
                         }
                     }
                    )
                }
            />
        }
    }
    )
    const { items, collectionProps, paginationProps } = useCollection(cardItems, {
        pagination: {
            pageSize: 1
        }
    })
    return (
        <Modal
        visible={visible}
        size="large"
        onDismiss={() => setVisible(false)}
        >
            <Cards
            {...collectionProps}
            cardsPerRow={[{cards: 1}]}
            cardDefinition={{
                header: item => (item.name),
                sections: [
                    {
                        id: "values",
                        content: item => (item.values)
                    }
                ]
            }}
            items={items}
            pagination={
                <Pagination {...paginationProps}/>
            }
            ></Cards>
        </Modal>
    )
}