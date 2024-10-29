import React from "react";
import { AppLayout, Box, CardsProps, Container, ContentLayout, Flashbar, FlashbarProps, Header, HelpPanel, KeyValuePairs, Link, SideNavigation, SpaceBetween, SplitPanel } from "@cloudscape-design/components";
import { fetchAdditionalData, flashbarMessage } from "./common";
import { TeamsGrid } from "./components/TeamGrid";
import { PoolModal } from "./components/PoolModal";

export default function App() {
  const [toolsOpen, setToolsOpen] = React.useState<boolean>(false)
  const [navOpen, setNavOpen] = React.useState<boolean>(true)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [loadingExtraData, setLoadingExtraData] = React.useState<boolean>(true)
  const [notifications, setNotifications] = React.useState<FlashbarProps.MessageDefinition[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [selectedWeek, setSelectedWeek] = React.useState<string>("1")
  const [selectedTeam, setSelectedTeam] = React.useState<Record<string, any>[]>([])
  // setNotifications(currentNotifications => [...currentNotifications, flashbarMessage({header: "test", type: "error", content: "foo", setNotifications: setNotifications})])

  const [teams, setTeams] = React.useState<Record<string, any>[]>([]);
  const apiUrls = Array.from({ length: 34 }, (_, i) => `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams/${i + 1}?lang=en&region=us`);
  const fetchData = async () => {
    const responses = await Promise.all(apiUrls.map(url => fetch(url)));
    const data = await Promise.all(responses.map(response => response.json()));
    setTeams(data)
    setLoading(false)
  }
  React.useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading]);
  
  React.useEffect(() => {
    if (loadingExtraData && !loading) {
      const fetchExtraData = async () => {
        const teamsWithExtraData = await Promise.all(
          teams.map(async (team) => {
            let recordData = null;
            let eventData = [];
            if (team.record && team.record.$ref) {
              recordData = await fetchAdditionalData(team.record.$ref);
            }
            if (team.events && team.events.$ref) {
              const eventsResponse = await fetchAdditionalData(team.events.$ref);
  
              // For each event $ref, fetch detailed event data
              if (eventsResponse.items) {
                eventData = await Promise.all(
                  eventsResponse.items.map((eventItem) => fetchAdditionalData(eventItem.$ref))
                );
              }
            }
            return { ...team, recordData, eventData};
          })
        );
        setTeams(teamsWithExtraData);
        setLoadingExtraData(false);
      };
      fetchExtraData();
    }
  }, [loading, teams]);

  return (
    <AppLayout
    navigationOpen={navOpen}
    navigation={
      <SideNavigation
        header={
          {
            text: "Football Pool",
            href:"/"
          }
        }
        items={
          [1, 2].map(week => (
            {type: "link", text: `Week ${week}`, href: `${week}`}
          ))
        }
        onFollow={event => {
          event.preventDefault()
          setSelectedWeek(event.detail.href)
          setShowModal(true)
        }}
      />
    }
    onNavigationChange={({detail}) => (
      setNavOpen(detail.open)
    )}
    notifications={
      <Flashbar
      items={
        notifications
      }
      />
    }
    toolsOpen={toolsOpen}
    tools={
      <HelpPanel/>
    }
    onToolsChange={({ detail }) => {
      setToolsOpen(detail.open);
    }}
    content={
      <ContentLayout
        header={
          <Header variant="h1" info={<Link variant="info">Info</Link>}>
            League Overview
          </Header>
        }
      >
        {!loadingExtraData && <TeamsGrid teams={teams} selectedItems={selectedTeam} setSelectedItems={setSelectedTeam}/>}
        <PoolModal key={selectedWeek} teams={teams} visible={showModal} setVisible={setShowModal} week={selectedWeek}/>
        </ContentLayout>
    }
    splitPanel={
      <SplitPanel header="Team Stats" hidePreferencesButton={true}>
        {selectedTeam.length > 0 && selectedTeam[0].teamInfo.recordData.items.map(recordType => {
          return (
            <Container key={`selectedTeam[0].name-${recordType.name}`}
            header={<Header>{recordType.name}</Header>}>
              <KeyValuePairs key={selectedTeam[0].displayName} columns={5}
              items={recordType.stats.map(record => (
                {
                  label: record.displayName,
                  value: record.value
                }
            ))}/>
          </Container>
        )
        })}
      </SplitPanel>
    }
    />
  );
}