## Prior to optimization

```
Settings { width: 101, height: 103 }
part1 211692000
part2 6587

real    0m39.589s
user    0m51.985s
sys     0m2.684s
```

## Using a single `trackingGrid`

Instead of having `biggestCluster()` re-create a grid every time.

```
Settings { width: 101, height: 103 }
part1 211692000
part2 6587

real    0m35.519s
user    0m36.350s
sys     0m1.566s
```

Still, `biggestCluster()` uses `Region` internally, which creates new grids anyway.

## Update `biggestCluster()` to ignore 0's up front

Rather than having the region finder finall *all* regions, updated the region finder
code to accept a callbacks which can be used to ignore 0's up front -- as opposed
to finding all regions (including empty/0-regions) and filtering out the empties.

```
Settings { width: 101, height: 103 }
part1 211692000
part2 6587

real    0m4.439s
user    0m4.273s
sys     0m0.120s
```

## Update Region finder to use auto-expanding grid

I would not have assumed switching to use a 0x0 grid with auto-expansion by default
would matter. And indeed, it doesn't seem to matter.

```
Settings { width: 101, height: 103 }
part1 211692000
part2 6587

real    0m4.412s
user    0m4.140s
sys     0m0.138s
```

Maybe a hair of a difference, but nothing to write home about.

## Other ideas

1. Maybe `Region.findAll()` could be made to reuse its mapping grid.
1. Update static grids to be backed by single-dimensional arrays.
1. Allow grids for numbers and chars to be initialized as dense primitive-type arrays.