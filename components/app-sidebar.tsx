import { title } from "process";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Home, Vote } from "lucide-react";
import { names } from "@/lib/utils";

const home = {
  title: "Home",
  url: "/",
  icon: Home,
};

const electionItems = [
  {
    title: names.congress.name,
    url: "/elections/congress_elections",
    icon: Vote,
  },
];

const pollItems = [
    {
        title: names.congress.name,
        url: "/polls/congress_elections",
        icon: Vote,
    }
]

export default function SideNav() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
            <SidebarMenuItem key={home.title}>
              <SidebarMenuButton asChild>
                <a href={home.url}>
                  <home.icon />
                  <span>{home.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Elecciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {electionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Encuestas electorales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pollItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
