import { PropsWithChildren, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListSubheader,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import EventNoteIcon from "@mui/icons-material/EventNote";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EventIcon from "@mui/icons-material/Event";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation } from "react-router-dom";
import { useRBAC } from "@/hooks/useRBAC";
import { useAppDispatch, setRole } from "@/store";

const drawerWidth = 280;

export function AppLayout({ children }: PropsWithChildren) {
  const { menu, role } = useRBAC();
  const location = useLocation();
  const dispatch = useAppDispatch();

  function iconFor(path: string) {
    if (path.startsWith("/hebergement/gestion"))
      return <CalendarMonthIcon fontSize="small" />;
    if (path.startsWith("/hebergement/clients"))
      return <PeopleIcon fontSize="small" />;
    if (path.startsWith("/hebergement/stock"))
      return <LocalLaundryServiceIcon fontSize="small" />;
    if (path.startsWith("/hebergement/tarifs"))
      return <MonetizationOnIcon fontSize="small" />;

    if (path.startsWith("/resto/plan"))
      return <TableRestaurantIcon fontSize="small" />;
    if (path.startsWith("/resto/menu"))
      return <RestaurantMenuIcon fontSize="small" />;
    if (path.startsWith("/resto/stock"))
      return <Inventory2Icon fontSize="small" />;
    if (path.startsWith("/resto/evenements"))
      return <EventIcon fontSize="small" />;

    if (path.startsWith("/financier"))
      return <ReceiptLongIcon fontSize="small" />;
    if (path.startsWith("/admin")) return <GroupIcon fontSize="small" />;
    if (path.startsWith("/parametres"))
      return <SettingsIcon fontSize="small" />;
    return <DashboardIcon fontSize="small" />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
        color="inherit"
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={800} sx={{ mr: 3 }}>
            NAS CONNECT
          </Typography>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              px: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: 420,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <SearchIcon fontSize="small" />
            <InputBase placeholder="Rechercher..." sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ flex: 1 }} />
          <Button startIcon={<DownloadIcon />} variant="outlined">
            Télécharger
          </Button>
          <IconButton sx={{ ml: 1 }} color="inherit">
            <Badge color="error" variant="dot">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <RoleSwitcher onChange={(r) => dispatch(setRole(r))} value={role} />
          <Avatar sx={{ ml: 2, width: 36, height: 36 }}>NE</Avatar>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", p: 1 }}>
          <List>
            <ListItemButton
              component={Link}
              to="/dashboard"
              selected={location.pathname.startsWith("/dashboard")}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </List>
          <Divider />
          {menu.sections.map((section) => (
            <List
              key={section.label}
              subheader={<ListSubheader>{section.label}</ListSubheader>}
            >
              {section.children.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={location.pathname.startsWith(item.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {iconFor(item.path)}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          ))}
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

function RoleSwitcher({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const roles = [
    "admin",
    "reception",
    "chef_salle",
    "serveur",
    "cuisine",
    "bar",
    "comptoir",
    "economat",
    "comptable",
    "direction",
  ] as const;
  return (
    <>
      <Button
        variant="text"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ml: 1 }}
      >
        Rôle: {value}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {roles.map((r) => (
          <MenuItem
            key={r}
            onClick={() => {
              onChange(r as any);
              setAnchor(null);
            }}
          >
            {" "}
            {r}{" "}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
