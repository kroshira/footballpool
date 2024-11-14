import React from "react";
import { AppLayout, Button, Container, ContentLayout, Flashbar, FlashbarProps, Header, HelpPanel, KeyValuePairs, Link, SideNavigation, SpaceBetween, SplitPanel } from "@cloudscape-design/components";
import { convertToHttps, fetchAdditionalData, range } from "./common";
import { TeamsGrid } from "./components/TeamGrid";
import { PoolModal } from "./components/PoolModal";
import { LeagueStatsModal } from "./components/LeagueStatsModal";


export default function App() {
  const [toolsOpen, setToolsOpen] = React.useState<boolean>(false)
  const [navOpen, setNavOpen] = React.useState<boolean>(true)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [loadingExtraData, setLoadingExtraData] = React.useState<boolean>(true)
  const [notifications, setNotifications] = React.useState<FlashbarProps.MessageDefinition[]>([])
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [showLeagueStatsModal, setShowLeagueStatsModal] = React.useState<boolean>(false)
  const [selectedWeek, setSelectedWeek] = React.useState<string>("1")
  const [selectedTeams, setSelectedTeams] = React.useState<Record<string, any>[]>([])

  const [teams, setTeams] = React.useState<Record<string, any>[]>([]);
  const apiUrls = Array.from({ length: 34 }, (_, i) => `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams/${i + 1}?lang=en&region=us`);
  const fetchData = React.useCallback(async () => {
    const responses = await Promise.all(apiUrls.map((url) => fetch(convertToHttps(url))));
    const data = await Promise.all(responses.map((response) => response.json()));
    setTeams(data);
    setLoading(false);
  }, [apiUrls]);
  
  React.useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);
  
  React.useEffect(() => {
    if (loadingExtraData && !loading) {
      const fetchExtraData = async () => {
        const teamsWithExtraData = await Promise.all(
          teams.map(async (team) => {
            let recordData = null;
            let eventData = [];
            let statsData = null;
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
            if (team.statistics && team.statistics.$ref) {
              statsData = await fetchAdditionalData(team.statistics.$ref)
            }
            return { ...team, recordData, eventData, statsData};
          })
        );
        setTeams(teamsWithExtraData);
        setLoadingExtraData(false);
      };
      fetchExtraData();
    }
  }, [loading, teams, loadingExtraData]);

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
          range(1, 19).map(week => (
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
          <Header
            variant="h1"
            info={<Link variant="info">Info</Link>}
            actions={
              <Button variant="primary" onClick={() => 
                setShowLeagueStatsModal(currentState => (!currentState))
              }>League Stats</Button>
            }
            >
            League Overview
          </Header>
        }
      >
        {!loadingExtraData && <TeamsGrid teams={teams} selectedItems={selectedTeams} setSelectedItems={setSelectedTeams}/>}
        <PoolModal
          key={selectedWeek}
          teams={teams}
          visible={showModal}
          setVisible={setShowModal}
          week={selectedWeek}
          setNotifications={setNotifications}/>
        {!loadingExtraData && <LeagueStatsModal
            teams={teams}
            visible={showLeagueStatsModal}
            setVisible={setShowLeagueStatsModal}
          />}
        </ContentLayout>
    }
    splitPanel={
      <SplitPanel header="Team Stats" hidePreferencesButton={true}>
        <SpaceBetween direction="horizontal" size="s">
        {selectedTeams.length > 0 && 
        
        selectedTeams.map(team => {
        
        return (
          <Container key={team.name} header={<Header>{team.name}</Header>}>
            {
          team.teamInfo.recordData.items.map(recordType => {
          return (
            <Container key={`${team.name}-${recordType.name}`}
            header={<Header>{recordType.name}</Header>}>
              <KeyValuePairs key={team.displayName}
              items={recordType.stats.map(record => (
                {
                  label: record.displayName,
                  value: record.value
                }
            ))}/>
            
          </Container>
        )})}
        </Container>
      )

        })}
        </SpaceBetween>
      </SplitPanel>
    }
    />
  );
}