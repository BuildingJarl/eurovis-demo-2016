export function calculateHierarchyDepth(el) {
    if (!el.children)
        return 0;
    var max = -1;
    
    for ( var i = 0; i < el.children.length; i++) {
      if(el.children[i].type !== 'text') {
        var h = calculateHierarchyDepth(el.children[i]);
        if (h > max) {
            max = h;
        }
       }
    }
    return max + 1;
}