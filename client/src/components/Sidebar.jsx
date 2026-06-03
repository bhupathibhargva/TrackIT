import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Badge, Stack,
} from '@mui/material';
import DashboardOutlinedIcon      from '@mui/icons-material/DashboardOutlined';
import FormatListBulletedIcon     from '@mui/icons-material/FormatListBulleted';
import CalendarMonthOutlinedIcon  from '@mui/icons-material/CalendarMonthOutlined';
import AutoAwesomeIcon            from '@mui/icons-material/AutoAwesome';
import NotificationsOutlinedIcon  from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon       from '@mui/icons-material/SettingsOutlined';
import FiberManualRecordIcon      from '@mui/icons-material/FiberManualRecord';

const DRAWER_WIDTH = 232;

const NAV = [
  { view: 'dashboard', icon: <DashboardOutlinedIcon />,     label: 'Dashboard'    },
  { view: 'lists',     icon: <FormatListBulletedIcon />,    label: 'All Tasks'    },
  { view: 'calendar',  icon: <CalendarMonthOutlinedIcon />, label: 'Schedule'     },
  { view: 'ai',        icon: <AutoAwesomeIcon />,           label: 'AI Assistant' },
];

function SidebarContent({ user, view, setView, apiKey, alertCount, syncMsg, setSidebarOpen, setShowNotifs, setShowSettings, switchUser, isMobile, tasks }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#27201A', color: 'white' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.25, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: 'white' }}>
          Family HQ
        </Typography>
        <Typography sx={{ fontSize: 10, opacity: 0.35, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 1.75, color: 'white' }}>
          Life Planner
        </Typography>
        {/* User switcher */}
        <Stack direction="row" spacing={0.75}>
          {['Bhargav', 'Rupa'].map(u => (
            <Box
              key={u}
              component="button"
              onClick={() => switchUser(u)}
              sx={{
                flex: 1, py: '7px', px: '4px', borderRadius: '7px',
                border: '1px solid',
                borderColor: user === u ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)',
                bgcolor: user === u ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: user === u ? 'white' : 'rgba(255,255,255,0.38)',
                fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.8)' },
              }}
            >
              {u[0]} {u}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, py: 1.5 }} disablePadding>
        {NAV.map(({ view: v, icon, label }) => (
          <ListItemButton
            key={v}
            selected={view === v}
            onClick={() => { setView(v); if (isMobile) setSidebarOpen(false); }}
            sx={{
              py: 1.25, px: 2.5,
              borderLeft: '2px solid',
              borderLeftColor: view === v ? '#E8956A' : 'transparent',
              color: view === v ? 'white' : 'rgba(255,255,255,0.4)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: 'white' },
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } },
              gap: 1.25,
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: 'inherit', '& svg': { fontSize: 20 } }}>{icon}</ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: view === v ? 500 : 400, color: 'inherit' }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.875 }}>
        <Box
          component="button"
          onClick={() => setShowNotifs(v => !v)}
          sx={{
            width: '100%', py: '9px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.18)',
            bgcolor: 'transparent', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
            fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' },
          }}
        >
          <Badge badgeContent={alertCount} color="error">
            <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
          </Badge>
          Alerts
        </Box>
        <Box
          component="button"
          onClick={() => setShowSettings(true)}
          sx={{
            width: '100%', py: '9px', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.18)',
            bgcolor: apiKey ? 'transparent' : 'rgba(184,92,56,0.3)',
            color: apiKey ? 'rgba(255,255,255,0.5)' : '#F5C4AE',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
            fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            '&:hover': { bgcolor: apiKey ? 'rgba(255,255,255,0.05)' : 'rgba(184,92,56,0.45)' },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
          {apiKey ? 'Settings' : 'Set AI Key'}
        </Box>
        <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <FiberManualRecordIcon sx={{
            fontSize: 7,
            color: syncMsg === 'syncing' ? '#E8956A' : 'rgba(255,255,255,0.25)',
          }} />
          <Typography sx={{ fontSize: 11, opacity: 0.35, color: 'white' }}>
            {syncMsg === 'syncing' ? 'Saving…' : 'Synced'}
          </Typography>
        </Box>
        {tasks && (
          <Typography sx={{ textAlign: 'center', fontSize: 11, opacity: 0.28, color: 'white' }}>
            {tasks.filter(t => t.done).length}/{tasks.length} done
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function Sidebar(props) {
  const { sidebarOpen, setSidebarOpen, isMobile } = props;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? sidebarOpen : true}
      onClose={() => setSidebarOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
      }}
    >
      <SidebarContent {...props} />
    </Drawer>
  );
}
