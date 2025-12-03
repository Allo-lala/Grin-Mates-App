#!/usr/bin/env node

/**
 * Verification script for performance optimizations
 * Checks that all optimization configurations are in place
 * Requirements: 5.2, 5.3, 5.4
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying performance optimizations...\n');

let allChecksPass = true;

// Check 1: Bundle analyzer is installed
console.log('1. Checking bundle analyzer installation...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  
  if (packageJson.devDependencies['@next/bundle-analyzer']) {
    console.log('   ✅ @next/bundle-analyzer is installed');
  } else {
    console.log('   ❌ @next/bundle-analyzer is NOT installed');
    allChecksPass = false;
  }
  
  if (packageJson.scripts['build:analyze']) {
    console.log('   ✅ build:analyze script is configured');
  } else {
    console.log('   ❌ build:analyze script is NOT configured');
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
  allChecksPass = false;
}

// Check 2: Next.js config has optimizations
console.log('\n2. Checking Next.js configuration...');
try {
  const configContent = fs.readFileSync(
    path.join(__dirname, '../next.config.js'),
    'utf8'
  );
  
  const checks = [
    { name: 'Bundle analyzer wrapper', pattern: /withBundleAnalyzer/ },
    { name: 'Compression enabled', pattern: /compress:\s*true/ },
    { name: 'SWC minification', pattern: /swcMinify:\s*true/ },
    { name: 'Console removal', pattern: /removeConsole/ },
    { name: 'Package import optimization', pattern: /optimizePackageImports/ },
    { name: 'Code splitting configuration', pattern: /splitChunks/ },
    { name: 'Image optimization', pattern: /formats:\s*\['image\/avif',\s*'image\/webp'\]/ },
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(configContent)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} NOT found`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('   ❌ Error reading next.config.js:', error.message);
  allChecksPass = false;
}

// Check 3: Unused dependencies removed
console.log('\n3. Checking for unused dependencies...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  
  const unusedDeps = [
    '@hookform/resolvers',
    '@tanstack/react-query',
    '@radix-ui/react-tabs',
    'class-variance-authority',
    'react-hook-form',
    'zod',
  ];
  
  const foundUnused = unusedDeps.filter(
    dep => packageJson.dependencies && packageJson.dependencies[dep]
  );
  
  if (foundUnused.length === 0) {
    console.log('   ✅ All unused dependencies removed');
  } else {
    console.log('   ❌ Found unused dependencies:', foundUnused.join(', '));
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error checking dependencies:', error.message);
  allChecksPass = false;
}

// Check 4: Sharp is installed for image optimization
console.log('\n4. Checking image optimization dependencies...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );
  
  if (packageJson.dependencies['sharp']) {
    console.log('   ✅ sharp is installed for optimal image processing');
  } else {
    console.log('   ⚠️  sharp is recommended for production image optimization');
  }
} catch (error) {
  console.log('   ❌ Error checking sharp:', error.message);
}

// Check 5: Dynamic imports utility exists
console.log('\n5. Checking code splitting utilities...');
try {
  const dynamicImportsPath = path.join(__dirname, '../src/lib/dynamic-imports.ts');
  if (fs.existsSync(dynamicImportsPath)) {
    console.log('   ✅ Dynamic imports utility exists');
  } else {
    console.log('   ❌ Dynamic imports utility NOT found');
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error checking dynamic imports:', error.message);
  allChecksPass = false;
}

// Check 6: LazyImage component exists
console.log('\n6. Checking image optimization components...');
try {
  const lazyImagePath = path.join(__dirname, '../src/components/ui/lazy-image.tsx');
  if (fs.existsSync(lazyImagePath)) {
    console.log('   ✅ LazyImage component exists');
  } else {
    console.log('   ❌ LazyImage component NOT found');
    allChecksPass = false;
  }
} catch (error) {
  console.log('   ❌ Error checking LazyImage:', error.message);
  allChecksPass = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('✅ All optimization checks passed!');
  console.log('\nNext steps:');
  console.log('  1. Run "npm run build" to verify production build');
  console.log('  2. Run "npm run build:analyze" to analyze bundle size');
  console.log('  3. Check that bundle sizes meet targets:');
  console.log('     - Initial bundle: < 200KB gzipped');
  console.log('     - Route chunks: < 50KB each');
  process.exit(0);
} else {
  console.log('❌ Some optimization checks failed!');
  console.log('\nPlease review the errors above and fix them.');
  process.exit(1);
}
