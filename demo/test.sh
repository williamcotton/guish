echo "fad foo\nbrick bro\nbonk nonk" | grep -i "f" | awk '{print $2}' | sed "s/foo/bar/g"