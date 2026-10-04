"""
Management command: scrape_scholarships
Scrapes real scholarships from university websites and portals.

Usage:
    python manage.py scrape_scholarships
    python manage.py scrape_scholarships --dry-run
    python manage.py scrape_scholarships --source "CSC Scholarships"
"""

from django.core.management.base import BaseCommand

from scholarship_scraper.scraper import run_scraper


class Command(BaseCommand):
    help = 'Scrape real scholarships from university websites and portals'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be scraped without creating records',
        )
        parser.add_argument(
            '--source',
            type=str,
            help='Run only a specific source by name',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output',
        )

    def handle(self, *args, **options):
        sources = None
        if options['source']:
            sources = [options['source']]
            self.stdout.write(f"Running source: {options['source']}")
        else:
            self.stdout.write("Running all enabled sources...")

        self.stdout.write("")
        results = run_scraper(
            sources=sources,
            dry_run=options['dry_run'],
            verbose=options['verbose'],
        )

        self.stdout.write("")
        self.stdout.write("=" * 50)
        self.stdout.write("SCRAPING RESULTS")
        self.stdout.write("=" * 50)
        self.stdout.write(f"Total found:     {results['total_found']}")
        self.stdout.write(f"Total created:   {results['total_created']}")
        self.stdout.write(f"Total skipped:   {results['total_skipped']}")
        self.stdout.write(f"Total errors:    {results['total_errors']}")

        if results['sources']:
            self.stdout.write("")
            for source_name, data in results['sources'].items():
                if 'error' in data:
                    self.stdout.write(f"  {source_name}: FAILED - {data['error']}")
                else:
                    self.stdout.write(
                        f"  {source_name}: found={data.get('found', 0)} "
                        f"created={data.get('created', 0)} "
                        f"skipped={data.get('skipped', 0)}"
                    )

        if options['dry_run']:
            self.stdout.write(self.style.WARNING("\n[DRY RUN] No records were created."))
