import asyncio
from rich.console import Console
from rich.table import Table
from rich.live import Live
import random

async def dashboard():
    console = Console()
    credits = 1000
    with Live(auto_refresh=False) as live:
        while True:
            latency = random.uniform(8.0, 32.0)
            credits -= int(latency * 0.05)
            table = Table(title="[cyan]HECTRON-Ψ: Panel de Control del Harness[/]")
            table.add_column("Métrica")
            table.add_column("Estado", style="green")
            table.add_row("Latencia de Canal", f"{latency:.2f} ms")
            table.add_row("Chrono-Credits", f"{credits} CR")
            table.add_row("Estabilidad Entrópica", "Óptima (98.4%)")
            live.update(table, refresh=True)
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(dashboard())
