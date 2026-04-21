# LOV Source Format

The item LOV source must return exactly six columns in this order:

| Column | Meaning |
| --- | --- |
| `status` | `0` for leaf nodes, non-zero for parent nodes |
| `level` | Hierarchy level, starting at `1` |
| `title` | Display label |
| `icon` | Optional icon class |
| `value` | Stable node ID |
| `tooltip` | Optional tooltip text |

## Example

```sql
select case when connect_by_isleaf = 1 then 0 else 1 end as status,
       level,
       ename as title,
       'fa-folder' as icon,
       empno as value,
       ename as tooltip
  from emp
 start with mgr is null
connect by prior empno = mgr
 order siblings by ename
```

## Value Rules

- `value` must be stable across refreshes.
- Only leaf node values are stored in the page item value.
- Unknown values are ignored when state is reconstructed after refresh.

See also [[Tri-State Model]].
