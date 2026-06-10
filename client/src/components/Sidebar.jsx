import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Badge, Stack,
} from '@mui/material';
import DashboardOutlinedIcon     from '@mui/icons-material/DashboardOutlined';
import FormatListBulletedIcon    from '@mui/icons-material/FormatListBulleted';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AutoAwesomeIcon           from '@mui/icons-material/AutoAwesome';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon      from '@mui/icons-material/SettingsOutlined';

const DRAWER_WIDTH = 232;

const NAV_ITEMS = [
  { view: 'dashboard', icon: <DashboardOutlinedIcon />,     label: 'Dashboard'    },
  { view: 'lists',     icon: <FormatListBulletedIcon />,    label: 'All Tasks'    },
  { view: 'calendar',  icon: <CalendarMonthOutlinedIcon />, label: 'Schedule'     },
  { view: 'ai',        icon: <AutoAwesomeIcon />,           label: 'AI Assistant' },
];

const ASSIGNEES = ['Bhargav', 'Rupa'];

function SidebarContent({ user, view, setView, apiKey, alertCount, syncMsg, setSidebarOpen, setShowNotifs, setShowSettings, switchUser, isMobile, tasks }) {
  const doneTasks  = tasks ? tasks.filter(t => t.done).length : 0;
  const totalTasks = tasks ? tasks.length : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1E1511', color: 'white' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'white', lineHeight: 1.2 }}>
          Family HQ
        </Typography>
        <Typography sx={{ fontSize: 10, opacity: 0.3, letterSpacing: '0.12em', textTransform: 'uppercase', mt: 0.25, color: 'white' }}>
          Life Planner
        </Typography>

        {/* Avatar user switcher */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {ASSIGNEES.map(name => {
            const active = user === name;
            return (
              <Box
                key={name}
                component="button"
                onClick={() => switchUser(name)}
                sx={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '5px', py: 1, px: 0.5, borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: active ? 'rgba(232,145,107,0.55)' : 'rgba(255,255,255,0.08)',
                  bgcolor: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: active ? 'rgba(232,145,107,0.55)' : 'rgba(255,255,255,0.18)' },
                }}
              >
                <Box sx={{
                  width: 34, height: 34, borderRadius: '50%',
                  bgcolor: active ? '#E8916B' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: active ? 'white' : 'rgba(255,255,255,0.4)',
                  border: `2px solid ${active ? 'rgba(255,255,255,0.25)' : 'transparent'}`,
                }}>
                  {name[0]}
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? 'white' : 'rgba(255,255,255,0.35)', fontFamily: 'inherit' }}>
                  {name}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, py: 1.5, px: 0 }} disablePadding>
        {NAV_ITEMS.map(({ view: navView, icon, label }) => {
          const active = view === navView;
          return (
            <ListItemButton
              key={navView}
              selected={active}
              onClick={() => { setView(navView); if (isMobile) setSidebarOpen(false); }}
              sx={{
                mx: 1.25, my: 0.25, borderRadius: 2,
                py: 0.875, px: 1.5, gap: 1.25,
                bgcolor: active ? 'rgba(232,145,107,0.16)' : 'transparent',
                color: active ? '#F5C4AE' : 'rgba(255,255,255,0.4)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)' },
                '&.Mui-selected': { bgcolor: 'rgba(232,145,107,0.16)', '&:hover': { bgcolor: 'rgba(232,145,107,0.22)' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, color: 'inherit', '& svg': { fontSize: 18 } }}>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 600 : 400, color: 'inherit' }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 1.5 }} />

      {/* Bottom actions */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box
          component="button"
          onClick={setShowNotifs}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.875,
            borderRadius: 2, border: 'none',
            bgcolor: 'transparent', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', fontSize: 13,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)' },
          }}
        >
          <Badge badgeContent={alertCount} color="error">
            <NotificationsOutlinedIcon sx={{ fontSize: 17 }} />
          </Badge>
          <Typography component="span" sx={{ fontSize: 13.5, fontWeight: 400, color: 'inherit', fontFamily: 'inherit' }}>
            Alerts
          </Typography>
          {alertCount > 0 && (
            <Box sx={{ ml: 'auto', px: 0.875, py: '2px', borderRadius: 5, bgcolor: 'rgba(197,48,48,0.25)', fontSize: 11, color: '#FC8181' }}>
              {alertCount}
            </Box>
          )}
        </Box>

        <Box
          component="button"
          onClick={setShowSettings}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.875,
            borderRadius: 2, border: 'none',
            bgcolor: apiKey ? 'transparent' : 'rgba(192,92,46,0.25)',
            color: apiKey ? 'rgba(255,255,255,0.4)' : '#F5C4AE',
            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            '&:hover': { bgcolor: apiKey ? 'rgba(255,255,255,0.07)' : 'rgba(192,92,46,0.38)', color: apiKey ? 'rgba(255,255,255,0.85)' : '#F5C4AE' },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 17 }} />
          <Typography component="span" sx={{ fontSize: 13.5, color: 'inherit', fontFamily: 'inherit' }}>
            {apiKey ? 'Settings' : 'Set AI Key'}
          </Typography>
        </Box>

        {/* Sync + progress */}
        <Box sx={{ px: 1.5, pt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%',
              bgcolor: syncMsg === 'syncing' ? '#E8916B' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }} />
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              {syncMsg === 'syncing' ? 'Saving…' : 'Synced'}
            </Typography>
          </Box>
          {tasks && (
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
              {doneTasks}/{totalTasks}
            </Typography>
          )}
        </Box>
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
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
      }}
    >
      <SidebarContent {...props} />
    </Drawer>
  );
}
