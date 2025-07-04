#\!/bin/bash

# Find all files with module-level Stripe initialization
echo "Finding files with module-level Stripe initialization..."

files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "const stripe = new Stripe.*process\.env\.STRIPE_SECRET_KEY" | sort -u)

for file in $files; do
  echo "Processing: $file"
  
  # Check if file already has lazy initialization
  if grep -q "function getStripe" "$file"; then
    echo "  - Already has lazy initialization, skipping"
    continue
  fi
  
  # Replace module-level initialization with lazy initialization
  perl -i -pe '
    if (/const stripe = new Stripe/) {
      $_ = "// Initialize Stripe lazily to avoid build-time errors\n";
      $_ .= "let stripe: Stripe | null = null;\n\n";
      $_ .= "function getStripe(): Stripe {\n";
      $_ .= "  if (\!stripe && process.env.STRIPE_SECRET_KEY) {\n";
      $_ .= "    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {\n";
    }
    elsif (/^\s*apiVersion:.*,$/ && $prev_line =~ /new Stripe/) {
      $_ .= "    });\n";
      $_ .= "  }\n";
      $_ .= "  if (\!stripe) {\n";
      $_ .= "    throw new Error('\''Stripe is not configured'\'');\n";
      $_ .= "  }\n";
      $_ .= "  return stripe;\n";
      $_ .= "}\n";
    }
    elsif (/^\}\);$/ && $prev_line =~ /apiVersion:/) {
      # Skip the closing }); as we handle it above
      $_ = "";
    }
    $prev_line = $_;
  ' "$file"
  
  # Replace all stripe. usages with getStripe().
  perl -i -pe 's/\bstripe\./getStripe()./g unless /let stripe:|function getStripe|stripe = new Stripe|\!stripe/' "$file"
  
  echo "  - Fixed"
done

echo "Done fixing Stripe initializations\!"
