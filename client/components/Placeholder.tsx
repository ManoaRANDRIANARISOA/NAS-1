import { Box, Paper, Typography } from "@mui/material";

export default function Placeholder({ title }: { title: string }) {
  return (
    <Box p={3}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          Contenu à générer. Dites-moi ce que vous souhaitez voir ici et je le
          construirai.
        </Typography>
      </Paper>
    </Box>
  );
}
